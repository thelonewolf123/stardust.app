import invariant from 'invariant'

import models from '@/backend/database'
import ec2Aws from '@/core/aws/ec2.aws'
import { ecr } from '@/core/aws/ecr.aws'
import { getDockerClient } from '@/core/docker'
import { Ec2InstanceType, InstanceExecArgs } from '@/types'
import {
    ERROR_CODES,
    LOCK,
    MAX_CONTAINER_SCHEDULE_ATTEMPTS,
    MAX_INSTANCE_STATUS_ATTEMPTS
} from '@constants/aws-infra'
import { sleep } from '@core/utils'

import {
    deleteContainer,
    getInstanceIdByContainerId,
    scheduleContainer,
    scheduleContainerBuild
} from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'
import { addLock, releaseLock } from '../lua/lock'

class InstanceStrategyAws {
    instanceAttempts: number = 0
    containerAttempts: number = 0
    containerBuildAttempts: number = 0
    publicIp: string | null = null
    instanceId: string | null = null

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

    async getInstanceForContainerBuild(args: {
        projectSlug: string
        containerSlug: string
    }): Promise<string> {
        this.containerBuildAttempts = 0

        while (!this.instanceId) {
            this.instanceId = await this.#isContainerBuildScheduled(args)
            await sleep(1000)
        }

        return this.instanceId
    }

    async exec(params: Omit<InstanceExecArgs, 'ipAddress'>) {
        invariant(this.publicIp, ERROR_CODES.INSTANCE_PUBLIC_IP_NOT_FOUND)
        console.log(`Executing command: ${params.command} on ${this.publicIp}`)
        return ec2Aws.execCommand({ ...params, ipAddress: this.publicIp })
    }

    async waitTillInstanceReady(instanceId?: string) {
        this.instanceAttempts = 0
        let isInstanceReady = false

        if (!instanceId) {
            invariant(this.instanceId, ERROR_CODES.INSTANCE_NOT_FOUND)
            instanceId = this.instanceId
        }

        while (!isInstanceReady) {
            isInstanceReady = await this.#isInstanceReady(instanceId)
            await sleep(1000)
        }

        const info = await ec2Aws.getInstanceInfoById(instanceId)
        const publicIp = info?.PublicIpAddress

        invariant(publicIp, ERROR_CODES.INSTANCE_PUBLIC_IP_NOT_FOUND)

        this.publicIp = publicIp

        await updateInstance(instanceId, {
            publicIp,
            status: 'running'
        })

        await models.Instance.updateOne(
            { instanceId: instanceId },
            { $set: { status: 'running', ipAddress: publicIp } }
        )

        return info
    }

    async getContainerInstance(containerId: string) {
        const instanceId = await getInstanceIdByContainerId(containerId)
        invariant(instanceId, ERROR_CODES.INSTANCE_NOT_FOUND)
        const info = await ec2Aws.getInstanceInfoById(instanceId)
        invariant(
            info && info.PublicIpAddress,
            ERROR_CODES.INSTANCE_PUBLIC_IP_NOT_FOUND
        )

        this.publicIp = info.PublicIpAddress
        this.instanceId = instanceId

        return info
    }

    async getDockerClient() {
        invariant(this.publicIp, ERROR_CODES.INSTANCE_PUBLIC_IP_NOT_FOUND)
        return getDockerClient(this.publicIp)
    }

    async terminateInstance(instanceId?: string) {
        if (!instanceId) {
            invariant(this.instanceId, ERROR_CODES.INSTANCE_NOT_FOUND)
            instanceId = this.instanceId
        }
        await ec2Aws.terminateInstance(instanceId)
        await models.Instance.updateOne(
            { instanceId },
            { $set: { status: 'terminated' } }
        )
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

    async #isContainerBuildScheduled(args: {
        projectSlug: string
        containerSlug: string
    }) {
        const instanceId = await scheduleContainerBuild(args)
        if (instanceId) return instanceId

        const lock = await addLock(LOCK.BUILDER_INSTANCE)
        console.log('lock: ', lock)

        if (lock === 'added') {
            await this.#scheduleNewInstance(1, Ec2InstanceType.builder)
            await releaseLock(LOCK.BUILDER_INSTANCE)
        }

        if (this.containerAttempts > MAX_CONTAINER_SCHEDULE_ATTEMPTS) {
            throw new Error(ERROR_CODES.CONTAINER_SCHEDULE_FAILED)
        }

        this.containerAttempts++

        return null
    }

    async #scheduleNewInstance(count: number, type: Ec2InstanceType) {
        const instanceList = await ec2Aws.requestEc2OnDemandInstance(count)
        invariant(instanceList, 'Instance not created')

        const newInstance = instanceList[0]
        const { InstanceId, ImageId } = newInstance

        invariant(InstanceId && ImageId, 'Instance not created')

        const result = await scheduleInstance(InstanceId, type, ImageId)
        invariant(result, 'Instance not scheduled')
        await models.Instance.create({
            instanceId: InstanceId,
            amiId: ImageId,
            instanceType: type,
            status: 'pending'
        })
        return InstanceId
    }

    async #markInstanceAsFailed(instanceId: string) {
        await updateInstance(instanceId, {
            status: 'failed'
        })
        await models.Instance.updateOne(
            { instanceId },
            {
                status: 'failed'
            }
        )
    }

    async #isInstanceReady(id: string) {
        try {
            const instanceInfo = await ec2Aws.getInstanceStatusById(id)
            console.log('instanceInfo: ', id, instanceInfo)
            if (instanceInfo?.Status === 'ok') {
                await models.Instance.findOneAndUpdate(
                    { instanceId: id },
                    {
                        status: 'running'
                    }
                )
                return true
            }

            if (this.instanceAttempts > MAX_INSTANCE_STATUS_ATTEMPTS) {
                await this.#markInstanceAsFailed(id)
                throw new Error(ERROR_CODES.INSTANCE_PROVISION_FAILED)
            }

            this.instanceAttempts++

            return false
        } catch (error) {
            console.error('Error in isInstanceReady:', error)
            await this.#markInstanceAsFailed(id)
            throw new Error(ERROR_CODES.INSTANCE_PROVISION_FAILED)
        }
    }

    getAuthConfig() {
        return ecr.getAuthorizationToken()
    }

    async freeContainerInstance(containerSlug: string) {
        invariant(this.instanceId, ERROR_CODES.INSTANCE_NOT_FOUND)
        await deleteContainer(containerSlug)
    }

    async getInstanceIp() {
        invariant(this.instanceId, ERROR_CODES.INSTANCE_NOT_FOUND)
        const info = await ec2Aws.getInstanceInfoById(this.instanceId)
        return info?.PublicIpAddress
    }
}

export default InstanceStrategyAws
