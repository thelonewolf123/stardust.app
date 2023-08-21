import Dockerode, { ContainerInspectInfo } from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import { makeQueryablePromise, sleep } from '@/core/utils'
import { ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'
import { CLOUD_PROVIDER } from '@constants/provider'
import { getDockerClient } from '@core/docker'
import ec2Aws from '@core/ec2.aws'

import InstanceStrategy from '../../library/instance'
import {
    deleteContainer,
    getContainer,
    getInstanceIdByContainerId,
    updateContainer
} from '../../lua/container'
import { updateInstance } from '../../lua/instance'
import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema
} from '../../schema'

export async function destroyContainer(
    data: z.infer<typeof ContainerDestroySchema>
): Promise<void> {
    console.log('destroy', data)

    const getInstance = async (containerId: string) => {
        const instanceId = await getInstanceIdByContainerId(containerId)
        invariant(instanceId, 'Instance not found')
        const instance = await ec2Aws.getInstanceInfoById(instanceId)
        invariant(instance, 'Instance not found')
        return instance
    }

    const stopAndRemoveContainer = async (
        docker: Dockerode,
        containerId: string
    ) => {
        const container = await docker.getContainer(containerId)
        await container.stop()
        await container.remove()
    }

    const handleError = async (error: Error) => {
        console.error('Container provision error: ', error)

        if (error.message !== ERROR_CODES.INSTANCE_NOT_FOUND) {
            const instanceId = await getInstanceIdByContainerId(
                data.containerId
            )
            if (!instanceId) return // instance already deleted
            await Promise.all([
                deleteContainer(data.containerId), // delete container
                updateInstance(instanceId, { status: 'failed' }) // update instance status
            ])

            return
        }

        throw error
    }

    return getInstance(data.containerId)
        .then((info) => {
            if (info.PublicIpAddress) return info.PublicIpAddress
            // most likely instance terminated!
            throw new Error(ERROR_CODES.INSTANCE_NOT_FOUND)
        })
        .then(getDockerClient)
        .then((docker) => stopAndRemoveContainer(docker, data.containerId))
        .catch(handleError)
}

export class DestroyContainerStrategy {
    #data: z.infer<typeof ContainerDestroySchema>
    #instance: InstanceStrategy
    #docker: Dockerode | null = null

    constructor(
        data: z.infer<typeof ContainerDestroySchema>,
        provider: ProviderType
    ) {
        this.#data = data
        this.#instance = new InstanceStrategy(provider)
    }

    getInstance = async (containerId: string) => {
        const instanceId = await getInstanceIdByContainerId(containerId)
    }

    stopAndRemoveContainer = async (docker: Dockerode, containerId: string) => {
        const container = await docker.getContainer(containerId)
        await container.stop()
        await container.remove()
    }

    handleError = async (error: Error) => {
        console.error('Container provision error: ', error)

        if (error.message !== ERROR_CODES.INSTANCE_NOT_FOUND) {
            const instanceId = await getInstanceIdByContainerId(
                this.#data.containerId
            )
            if (!instanceId) return // instance already deleted
            await Promise.all([
                deleteContainer(this.#data.containerId), // delete container
                updateInstance(instanceId, { status: 'failed' }) // update instance status
            ])

            return
        }

        throw error
    }
}
