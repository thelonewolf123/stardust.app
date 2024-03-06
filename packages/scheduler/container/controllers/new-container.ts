import Dockerode from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import models from '@/backend/database'
import { getPublisher } from '@/core/redis'
import InstanceStrategy from '@/scheduler/library/instance'
import { deleteContainer, updateContainer } from '@/scheduler/lua/container'
import { ContainerSchedulerSchema } from '@/schema'
import { ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'

export class NewContainerStrategy {
    #data: z.infer<typeof ContainerSchedulerSchema>
    #instance: InstanceStrategy
    #docker: Dockerode | null = null
    #container: Dockerode.Container | null = null
    #publisher: ReturnType<typeof getPublisher>

    constructor(
        data: z.infer<typeof ContainerSchedulerSchema>,
        provider: ProviderType
    ) {
        this.#data = data
        this.#instance = new InstanceStrategy(provider)
        this.#publisher = getPublisher('BUILD_LOGS', this.#data.containerSlug)
    }

    async #checkImageExistence() {
        invariant(this.#docker, 'Docker client not initialized')
        const images = await this.#docker.listImages()
        return images.some((imageData) => {
            return imageData.RepoTags?.some((tag) => tag === this.#data.image)
        })
    }

    async #pullImageIfNeeded() {
        console.log('Pulling image: ', this.#data.image)
        const imageExists = await this.#checkImageExistence()
        invariant(this.#docker, 'Docker client not initialized')

        if (!imageExists) {
            this.#publisher.publish('Pulling image...')
            const authconfig = await this.#instance.getAuthConfig()
            const stream = await this.#docker.pull(this.#data.image, {
                authconfig
            })

            await new Promise<void>((resolve, reject) => {
                invariant(this.#docker, 'Docker client not initialized')
                this.#docker.modem.followProgress(stream, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
            this.#publisher.publish('Image pulled successfully')
        }
    }

    async #startContainer() {
        console.log('Starting container: ', this.#data.containerSlug)
        invariant(this.#docker, 'Docker client not initialized')
        this.#publisher.publish('Starting container...')

        const env = this.#data.env || {}
        const ports = this.#data.ports || []

        const PortBindings: Record<string, { HostPort: string }[]> = {}
        ports.forEach((port) => {
            PortBindings[`${port}/tcp`] = [{ HostPort: `10000-11000` }]
        })

        const Env = Object.entries(env).map(([key, value]) => {
            return `${key}=${value}`
        })

        this.#container = await this.#docker.createContainer({
            Image: this.#data.image,
            Cmd: this.#data.command,
            Env,
            HostConfig: {
                PortBindings
            }
        })

        await this.#container.start()
        this.#publisher.publish('Container started successfully')
    }

    async #updateContainerStatus() {
        console.log('Updating container status...', this.#data.containerSlug)
        invariant(this.#container, 'Container not initialized')
        const info = await this.#container.inspect()
        await updateContainer(this.#data.containerSlug, {
            containerId: info.Id,
            status: 'running'
        })

        await models.Container.updateOne(
            { containerSlug: this.#data.containerSlug },
            {
                $set: {
                    containerId: info.Id,
                    status: 'running',
                    updatedAt: new Date()
                }
            }
        )
    }

    async #handleError(error: Error) {
        console.error('Container provision error: ', error)
        await deleteContainer(this.#data.containerSlug)
        await models.Container.updateOne(
            {
                containerSlug: this.#data.containerSlug
            },
            {
                $set: { status: 'pending', updatedAt: new Date() }
            }
        )

        if (error.message === ERROR_CODES.INSTANCE_PROVISION_FAILED) {
            console.log('Instance provision failed, retrying...')
        }

        throw error
    }

    createNewContainer = async () => {
        return this.#instance
            .getInstanceForNewContainer(this.#data.containerSlug)
            .then(() => this.#instance.waitTillInstanceReady())
            .then(() => this.#instance.getDockerClient())
            .then((docker) => (this.#docker = docker))
            .then(() => this.#pullImageIfNeeded())
            .then(() => this.#startContainer())
            .then(() => this.#updateContainerStatus())
            .catch((err) => this.#handleError(err))
    }
}
