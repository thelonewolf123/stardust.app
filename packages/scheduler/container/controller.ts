import Dockerode, { ContainerInspectInfo } from 'dockerode'
import invariant from 'invariant'
import { v4 } from 'uuid'
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
import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema
} from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const instance = new InstanceStrategy(CLOUD_PROVIDER)

    const checkImageExistence = async (docker: Dockerode, image: string) => {
        const images = await docker.listImages()
        return images.some((imageData) => {
            return imageData.RepoTags?.some((tag) => tag === image)
        })
    }

    const pullImageIfNeeded = async (docker: Dockerode) => {
        const imageExists = await checkImageExistence(docker, data.image)

        if (!imageExists) {
            const stream = await docker.pull(data.image)

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

    const startContainer = async (docker: Dockerode) => {
        const env = data.env || {}
        const ports = data.ports || []

        const PortBindings: Record<string, { HostPort: string }[]> = {}
        ports.forEach((port) => {
            PortBindings[`${port}/tcp`] = [{ HostPort: `10000-11000` }]
        })

        const Env = Object.entries(env).map(([key, value]) => {
            return `${key}=${value}`
        })

        const newContainer = await docker.createContainer({
            Image: data.image,
            Cmd: data.command,
            Env,
            HostConfig: {
                PortBindings
            }
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
        await deleteContainer(data.containerSlug)

        if (error.message === ERROR_CODES.INSTANCE_PROVISION_FAILED) {
            console.log('Instance provision failed, retrying...')
        }

        throw error
    }

    return instance
        .getInstanceForNewContainer(data.containerSlug)
        .then(instance.waitTillInstanceReady)
        .then((info) => {
            if (info.PublicIpAddress) return info.PublicIpAddress
            // most likely instance terminated! or provision failed
            throw new Error('Public IP not found')
        })
        .then(getDockerClient)
        .then(async (docker) => {
            await pullImageIfNeeded(docker)
            return docker
        })
        .then(async (docker) => {
            const info = await startContainer(docker)
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

export async function buildContainer(
    data: z.infer<typeof ContainerBuildSchema>
) {
    const instance = new InstanceStrategy(CLOUD_PROVIDER)

    console.log('Build container!', data)
    const buildDockerImage = async (docker: Dockerode) => {
        const context = data.dockerContext || '.'
        const dockerfilePath = data.dockerPath || 'Dockerfile'

        const buildStream = await docker.buildImage(
            {
                context,
                src: [dockerfilePath]
            },
            {
                buildargs: data.buildArgs || {},
                t: data.ecrRepo
            }
        )

        await new Promise<void>((resolve, reject) => {
            docker.modem.followProgress(buildStream, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })

        console.log('Image built successfully.')

        return docker
    }

    const pushDockerImage = async (docker: Dockerode) => {
        const image = await docker.getImage(data.ecrRepo)
        const stream = await image.push()

        await new Promise<void>((resolve, reject) => {
            docker.modem.followProgress(stream, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })

        return docker
    }

    return instance
        .getInstanceForContainerBuild(data.projectSlug)
        .then(instance.waitTillInstanceReady)
        .then((info) => {
            invariant(
                info.PublicIpAddress && info.InstanceId,
                'Instance not found'
            )
            return [info.InstanceId, info.PublicIpAddress]
        })
        .then(async ([instanceId, publicIp]) => {
            return publicIp
        })
        .then(getDockerClient)
        .then(buildDockerImage)
        .then(pushDockerImage)
        .catch((error) => {
            console.error('Container provision error: ', error)
            throw error
        })
}
