import Dockerode, { ContainerInspectInfo } from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import ec2Aws from '@core/ec2.aws'

import { getDockerClient } from '../library/docker'
import {
    getInstanceForNewContainer,
    waitTillInstanceReady
} from '../library/instance'
import { getInstanceIdByContainerId, updateContainer } from '../lua/container'
import { ContainerDestroySchema, ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const getInstanceInfo = async (instanceId: string) => {
        const instance = await ec2Aws.getInstanceInfoById(instanceId)
        return instance
    }

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
        command: string[]
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

    return getInstanceForNewContainer(data.containerSlug)
        .then(waitTillInstanceReady)
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
            console.log('docker', docker, info)
        })
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

    return getInstance(data.containerId)
        .then((instance) => instance?.PublicIpAddress!)
        .then(getDockerClient)
        .then(async (docker) => {
            await stopAndRemoveContainer(docker, data.containerId)
        })
}
