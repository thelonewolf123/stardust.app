import Dockerode, { ContainerInspectInfo } from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import { ERROR_CODES } from '@constants/aws-infra'
import { CLOUD_PROVIDER } from '@constants/provider'
import { getDockerClient } from '@core/docker'
import ec2Aws from '@core/ec2.aws'

import InstanceStrategy from '../library/instance'
import {
    deleteContainer,
    getInstanceIdByContainerId,
    updateContainer
} from '../lua/container'
import { updateInstance } from '../lua/instance'
import { ContainerDestroySchema, ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>,
    publish: (message: Record<string, unknown>) => boolean
) {
    const instance = new InstanceStrategy(CLOUD_PROVIDER)

    const checkImageExistence = async (docker: Dockerode, image: string) => {
        const images = await docker.listImages()
        return images.some((imageData) => {
            return imageData.RepoTags?.some((tag) => tag === image)
        })
    }

    const pullImageIfNeeded = async (docker: Dockerode, image: string) => {
        const imageExists = await checkImageExistence(docker, image)

        if (!imageExists) {
            const stream = await docker.pull(image)

            await new Promise<void>((resolve, reject) => {
                docker.modem.followProgress(stream, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }

    const startContainer = async (
        docker: Dockerode,
        image: string,
        command?: string[]
    ) => {
        const newContainer = await docker.createContainer({
            Image: image,
            Cmd: command
        })

        await newContainer.start()
        return newContainer.inspect()
    }

    const updateContainerStatus = async (
        containerSlug: string,
        info: ContainerInspectInfo
    ) => {
        await updateContainer(containerSlug, {
            containerId: info.Id,
            status: 'running'
        })
    }

    const handleError = async (error: Error) => {
        console.error('Container provision error: ', error)
        if (error.message === ERROR_CODES.INSTANCE_PROVISION_FAILED) {
            await deleteContainer(data.containerSlug)
            publish(data)
            return
        }
        throw error
    }

    return instance
        .getInstanceForNewContainer(data.containerSlug)
        .then(instance.waitTillInstanceReady)
        .then((info) => {
            if (info.PublicIpAddress) return info.PublicIpAddress
            throw new Error('Public IP not found')
        })
        .then(getDockerClient)
        .then(async (docker) => {
            await pullImageIfNeeded(docker, data.image)
            return docker
        })
        .then(async (docker) => {
            const info = await startContainer(docker, data.image, data.command)
            await updateContainerStatus(data.containerSlug, info)
            console.log('docker', info)
        })
        .catch(handleError)
}

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
