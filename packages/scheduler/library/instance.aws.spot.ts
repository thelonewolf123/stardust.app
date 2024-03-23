import invariant from 'invariant'

import models from '@/backend/database'
import ec2Aws from '@/core/aws/ec2.aws'
import { sleep } from '@/core/utils'
import { Ec2InstanceType } from '@/types'
import {
    ERROR_CODES,
    LOCK,
    MAX_CONTAINER_SCHEDULE_ATTEMPTS
} from '@constants/aws-infra'

import { scheduleContainer } from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'
import { addLock, releaseLock } from '../lua/lock'
import InstanceStrategyAws from './instance.aws'

class InstanceStrategyAwsSpot extends InstanceStrategyAws {
    pricePerHour: number = 1 // default price - $1 per hour

    constructor(pricePerHour: number) {
        super()
        this.pricePerHour = pricePerHour
    }

    async #scheduleNewInstance(count: number, type: Ec2InstanceType) {
        const requestId = await ec2Aws.requestEc2SpotInstance(count)
        invariant(requestId, 'Instance not created')
        const instanceIds = await ec2Aws.waitForSpotInstanceRequest(requestId)

        if (instanceIds.length === 0) {
            throw new Error('No instance found')
        }

        return Promise.all(
            instanceIds.map(async (instanceId) => {
                await this.#addInstanceToDb(instanceId, type)
            })
        )
    }

    async #addInstanceToDb(instanceId: string, type: Ec2InstanceType) {
        const newInstance = await ec2Aws.getInstanceInfoById(instanceId)
        invariant(newInstance, 'Instance not created')

        const { InstanceId, ImageId, PublicIpAddress } = newInstance

        invariant(InstanceId && ImageId, 'Instance not created')

        const result = await scheduleInstance(InstanceId, type, ImageId)
        const updateResponse = await updateInstance(instanceId, {
            status: 'running',
            publicIp: PublicIpAddress
        })
        invariant(result && updateResponse, 'Instance not scheduled')

        await models.Instance.create({
            instanceId: InstanceId,
            amiId: ImageId,
            instanceType: type,
            status: 'running',
            ipAddress: PublicIpAddress
        })
        return InstanceId
    }

    async #isContainerScheduled(containerSlug: string) {
        const instanceId = await scheduleContainer(containerSlug)
        if (instanceId) return instanceId

        const lock = await addLock(LOCK.CONTAINER_INSTANCE)
        console.log('lock: ', lock)

        if (lock === 'added') {
            await this.#scheduleNewInstance(1, Ec2InstanceType.runner)
            await releaseLock(LOCK.CONTAINER_INSTANCE)
        }

        if (this.containerAttempts > MAX_CONTAINER_SCHEDULE_ATTEMPTS) {
            throw new Error(ERROR_CODES.CONTAINER_SCHEDULE_FAILED)
        }

        this.containerAttempts++

        return null
    }

    async getInstanceForNewContainer(containerSlug: string) {
        this.containerAttempts = 0
        let instanceId: null | string = null

        while (!instanceId) {
            instanceId = await this.#isContainerScheduled(containerSlug)
            await sleep(1000)
        }

        this.instanceId = instanceId
        return instanceId
    }
}

export default InstanceStrategyAwsSpot
