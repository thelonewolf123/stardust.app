import Dockerode from 'dockerode'
import invariant from 'invariant'
import { z } from 'zod'

import models from '@/backend/database'
import InstanceStrategy from '@/scheduler/library/instance'
import { deleteContainer } from '@/scheduler/lua/container'
import { updateInstance } from '@/scheduler/lua/instance'
import { ContainerDestroySchema } from '@/schema'
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
        const container = this.#docker.getContainer(this.#data.containerId)
        await container.stop()
        await container.remove()
        await models.Container.updateOne(
            {
                containerId: this.#data.containerId
            },
            {
                $set: {
                    status: 'terminated',
                    updatedAt: new Date(),
                    terminatedAt: new Date()
                }
            }
        ).lean()
        await deleteContainer(this.#data.containerSlug)
    }

    async #handleError(error: Error) {
        console.error('Container provision error: ', error)

        if (error.message !== ERROR_CODES.INSTANCE_NOT_FOUND) {
            const instance = await this.#instance.getContainerInstance(
                this.#data.containerId
            )

            const container = await models.Container.findOne({
                containerId: this.#data.containerId
            }).lean()
            invariant(container, 'Container not found')
            invariant(this.#docker, 'Docker client not found')

            await this.#docker.getImage(container.image).remove()

            await models.Container.updateOne(
                {
                    containerId: this.#data.containerId
                },
                {
                    $set: {
                        status: 'terminated',
                        updatedAt: new Date(),
                        terminatedAt: new Date()
                    }
                }
            ).lean()

            if (!instance || !instance.InstanceId) return // instance already deleted

            await Promise.all([
                deleteContainer(this.#data.containerSlug), // delete container
                updateInstance(instance.InstanceId, { status: 'failed' }), // update instance status
                models.Instance.updateOne(
                    {
                        instanceId: instance.InstanceId
                    },
                    {
                        $set: {
                            status: 'failed',
                            updatedAt: new Date()
                        }
                    }
                ).lean()
            ])

            return
        }

        throw error
    }

    async destroyContainer() {
        return this.#instance
            .getContainerInstance(this.#data.containerId)
            .then(() => this.#instance.waitTillInstanceReady())
            .then(() => this.#instance.getDockerClient())
            .then((docker) => (this.#docker = docker))
            .then(() => this.#stopAndRemoveContainer())
            .catch((err) => this.#handleError(err))
    }
}
