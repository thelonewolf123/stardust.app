import invariant from 'invariant'

import {
    ERROR_CODES,
    INSTANCE_SCHEDULE_KEY,
    MAX_CONTAINER_SCHEDULE_ATTEMPTS,
    MAX_INSTANCE_STATUS_ATTEMPTS
} from '@constants/aws-infra'
import ec2Aws from '@core/ec2.aws'
import { sleep } from '@core/utils'

import { scheduleContainer } from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'
import { addLock, releaseLock } from '../lua/lock'

class InstanceStrategyAws {
    instanceAttempts: number = 0
    containerAttempts: number = 0

    async getInstanceForNewContainer(containerSlug: string) {
        this.containerAttempts = 0
        let instanceId: null | string = null

        while (!instanceId) {
            instanceId = await this.#isContainerScheduled(containerSlug)
            if (instanceId) break
            await sleep(1000)
        }

        return instanceId
    }

    async waitTillInstanceReady(id: string) {
        this.instanceAttempts = 0
        let isInstanceReady = false

        while (!isInstanceReady) {
            isInstanceReady = await this.#isInstanceReady(id)
            await sleep(1000)
        }

        const info = await ec2Aws.getInstanceInfoById(id)
        const publicIp = info?.PublicIpAddress

        invariant(publicIp, 'Instance not found')

        await updateInstance(id, {
            publicIp,
            status: 'running'
        })

        return info
    }

    async terminateInstance(instanceId: string) {
        await ec2Aws.terminateInstance(instanceId)
    }

    async #isContainerScheduled(containerSlug: string) {
        const instanceId = await scheduleContainer(containerSlug)
        if (instanceId) return instanceId

        const lock = await addLock(INSTANCE_SCHEDULE_KEY)
        console.log('lock: ', lock)

        if (lock === 'added') {
            await this.#scheduleNewInstance(1)
            await releaseLock(INSTANCE_SCHEDULE_KEY)
        }

        if (this.containerAttempts > MAX_CONTAINER_SCHEDULE_ATTEMPTS) {
            throw new Error(ERROR_CODES.CONTAINER_SCHEDULE_FAILED)
        }

        this.containerAttempts++

        return null
    }

    async #scheduleNewInstance(count: number) {
        const instanceList = await ec2Aws.requestEc2OnDemandInstance(count)
        invariant(instanceList, 'Instance not created')

        const newInstance = instanceList[0]
        const { InstanceId, ImageId } = newInstance

        invariant(InstanceId && ImageId, 'Instance not created')

        const result = await scheduleInstance(InstanceId, ImageId)
        invariant(result, 'Instance not scheduled')

        return InstanceId
    }

    async #isInstanceReady(id: string) {
        const instanceInfo = await ec2Aws.getInstanceStatusById(id)
        if (instanceInfo?.Status === 'ok') {
            return true
        }

        if (this.instanceAttempts > MAX_INSTANCE_STATUS_ATTEMPTS) {
            await updateInstance(id, {
                status: 'failed'
            })
            throw new Error(ERROR_CODES.INSTANCE_PROVISION_FAILED)
        }

        this.instanceAttempts++

        return false
    }
}

export default InstanceStrategyAws
