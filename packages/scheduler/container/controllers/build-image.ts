import Dockerode from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import { makeQueryablePromise, sleep } from '@/core/utils'
import { ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'
import { CLOUD_PROVIDER } from '@constants/provider'
import { getDockerClient } from '@core/docker'

import InstanceStrategy from '../../library/instance'
import { getContainer } from '../../lua/container'
import { ContainerBuildSchema } from '../../schema'

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

        const containerBuildPromise = makeQueryablePromise(
            new Promise((resolve, reject) => {
                docker.modem.followProgress(stream, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(true)
                    }
                })
            })
        )

        while (true) {
            // periodically check if promise is completed!
            if (containerBuildPromise.isFulfilled) {
                // The promise is completed
                console.log('Image pushed successfully.')
                break
            }

            const containerData = await getContainer({
                containerSlug: data.containerSlug,
                projectSlug: data.projectSlug
            })

            if (!containerData) {
                throw new Error(ERROR_CODES.CONTAINER_BUILD_FAILED)
            }

            if (containerData.containerSlug !== data.containerSlug) {
                throw new Error(ERROR_CODES.CONTAINER_BUILD_HAS_CANCELED)
            }

            await sleep(1000)
        }

        return docker
    }

    return instance
        .getInstanceForContainerBuild(data.containerSlug, data.projectSlug)
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

export class BuildImageStrategy {
    #data: z.infer<typeof ContainerBuildSchema>
    #instance: InstanceStrategy

    constructor(
        data: z.infer<typeof ContainerBuildSchema>,
        provider: ProviderType
    ) {
        this.#data = data
        this.#instance = new InstanceStrategy(provider)
    }

    buildDockerImage = async (docker: Dockerode) => {
        const context = this.#data.dockerContext || '.'
        const dockerfilePath = this.#data.dockerPath || 'Dockerfile'

        const buildStream = await docker.buildImage(
            {
                context,
                src: [dockerfilePath]
            },
            {
                buildargs: this.#data.buildArgs || {},
                t: this.#data.ecrRepo
            }
        )

        const containerBuildPromise = makeQueryablePromise(
            new Promise<void>((resolve, reject) => {
                docker.modem.followProgress(buildStream, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        )

        while (true) {
            // periodically check if promise is completed!
            if (containerBuildPromise.isFulfilled) {
                // The promise is completed
                console.log('Image pushed successfully.')
                break
            }

            const containerData = await getContainer({
                containerSlug: this.#data.containerSlug,
                projectSlug: this.#data.projectSlug
            })

            if (!containerData) {
                throw new Error(ERROR_CODES.CONTAINER_BUILD_FAILED)
            }

            if (containerData.containerSlug !== this.#data.containerSlug) {
                ;(buildStream as any).destroy() // destroy build stream
                throw new Error(ERROR_CODES.CONTAINER_BUILD_HAS_CANCELED)
            }

            await sleep(1000)
        }

        console.log('Image built successfully.')

        return docker
    }

    pushDockerImage = async (docker: Dockerode) => {
        const image = await docker.getImage(this.#data.ecrRepo)
        const stream = await image.push()

        await new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })

        return docker
    }
}
