import Dockerode from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import InstanceStrategy from '@/scheduler/library/instance'
import { deleteContainer } from '@/scheduler/lua/container'
import { updateInstance } from '@/scheduler/lua/instance'
import { ContainerDestroySchema } from '@/scheduler/schema'
import { ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'

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

    async #stopAndRemoveContainer() {
        invariant(this.#docker, 'Docker client not found')
        const container = await this.#docker.getContainer(
            this.#data.containerId
        )
        await container.stop()
        await container.remove()
    }

    async #handleError(error: Error) {
        console.error('Container provision error: ', error)

        if (error.message !== ERROR_CODES.INSTANCE_NOT_FOUND) {
            const instance = await this.#instance.getContainerInstance(
                this.#data.containerId
            )
            if (!instance || !instance.InstanceId) return // instance already deleted
            await Promise.all([
                deleteContainer(this.#data.containerId), // delete container
                updateInstance(instance.InstanceId, { status: 'failed' }) // update instance status
            ])

            return
        }

        throw error
    }

    destroyContainer() {
        return this.#instance
            .getContainerInstance(this.#data.containerId)
            .then(() => this.#instance.waitTillInstanceReady())
            .then(() => this.#instance.getDockerClient())
            .then((docker) => (this.#docker = docker))
            .then(() => this.#stopAndRemoveContainer())
            .catch((err) => this.#handleError(err))
    }
}
