import Dockerode from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import models from '@/backend/database'
import redis, { getPublisher } from '@/core/redis'
import { sleep } from '@/core/utils'
import InstanceStrategy from '@/scheduler/library/instance'
import {
    attachDomainToContainer,
    deleteContainer,
    updateContainer
} from '@/scheduler/lua/container'
import { ContainerSchedulerSchema } from '@/schema'
import { PortBindingMap, ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'

export class NewContainerStrategy {
    #data: z.infer<typeof ContainerSchedulerSchema>
    #instance: InstanceStrategy
    #docker: Dockerode | null = null
    #container: Dockerode.Container | null = null
    #publisher: ReturnType<typeof getPublisher>
    #instanceId: string | null | undefined = null

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
        invariant(this.#instanceId, 'Instance not found')

        const info = await this.#container.inspect()
        await updateContainer(this.#data.containerSlug, {
            containerId: info.Id,
            status: 'running'
        })

        const instance = await models.Instance.findOne({
            instanceId: this.#instanceId
        }).lean()

        invariant(instance, 'Instance not found')

        await models.Container.updateOne(
            { containerSlug: this.#data.containerSlug },
            {
                $set: {
                    containerId: info.Id,
                    status: 'running',
                    instanceId: instance,
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

    async #waitForPortNumbers(): Promise<Record<number, number>> {
        invariant(this.#container, 'Container not found!')
        let attempt_count = 0

        const portMap: Record<number, number> = {}

        if (!this.#data.ports || this.#data.ports.length === 0) {
            return portMap
        }

        while (attempt_count < 300) {
            const info = await this.#container.inspect()
            const bindings: PortBindingMap = info.HostConfig.PortBindings
            const ports = this.#data.ports || []
            ports.map((port) => {
                const binding = bindings[`${port}/tcp`]
                if (binding) {
                    portMap[port] = parseInt(binding[0].HostPort, 10)
                }
            })

            if (Object.keys(portMap).length === ports.length) {
                return portMap
            }

            await sleep(1000)
        }

        throw new Error("Ports didn't bind in time")
    }

    async #addDomainToContainer(portMap: Record<number, number>) {
        const projectSlug = this.#data.containerSlug.split(':')[0]
        invariant(projectSlug, 'Project slug not found')
        const project = await models.Project.findOne({
            slug: projectSlug
        }).lean()
        const domains = project?.domains || []
        const ipAddr = await this.#instance.getInstanceIp()
        const ports = this.#data.ports || []
        if (ports.length === 0) return

        // TODO: Handle port specific domains here @thelonewolf123
        const defaultHttpPort = portMap[ports[0]]
        const domainsPromise = domains.map(async (domain) =>
            attachDomainToContainer({
                domain,
                containerSlug: this.#data.containerSlug,
                ipAddr,
                portNumber: defaultHttpPort
            })
        )

        await Promise.all(domainsPromise)
    }

    createNewContainer = async () => {
        return this.#instance
            .getInstanceForNewContainer(this.#data.containerSlug)
            .then(() => this.#instance.waitTillInstanceReady())
            .then((instance) => (this.#instanceId = instance.InstanceId))
            .then(() => this.#instance.getDockerClient())
            .then((docker) => (this.#docker = docker))
            .then(() => this.#pullImageIfNeeded())
            .then(() => this.#startContainer())
            .then(() => this.#updateContainerStatus())
            .then(() => this.#waitForPortNumbers())
            .then((portMap) => this.#addDomainToContainer(portMap))
            .catch((err) => this.#handleError(err))
    }
}
