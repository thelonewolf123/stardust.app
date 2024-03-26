import invariant from 'invariant'

import models from '@/backend/database'
import { Container } from '@/backend/database/models/containers'
import { convertToObject } from '@/core/utils'
import { scheduleInstanceDelete } from '@/scheduler/lua/instance'
import { Context } from '@/types'
import { ContainerStatus } from '@/types/graphql-server'

export class SpotTerminateStrategy {
    #instanceId: string
    #createContainerQueue: Context['queue']['createContainer']

    constructor(
        instanceId: string,
        createContainerQueue: Context['queue']['createContainer']
    ) {
        this.#instanceId = instanceId
        this.#createContainerQueue = createContainerQueue
    }

    async #getAllContainers() {
        console.log('Getting all containers')
        const instance = await models.Instance.findOne({
            instanceId: this.#instanceId
        }).lean()

        invariant(instance, 'Instance not found')
        const containers = await models.Container.find({
            instanceId: instance._id,
            status: ContainerStatus.Running
        }).lean()
        return containers
    }

    async #rescheduleContainers(containers: Container[]) {
        containers.map((container) => {
            const { containerSlug } = container
            console.log('Rescheduling container: ', containerSlug)
            this.#createContainerQueue.publish({
                containerSlug,
                ports: container.port ? [container.port] : [],
                command: container.command || [],
                env: convertToObject(container.env),
                image: container.image
            })
        })
    }

    async #scheduleInstanceForDeletion() {
        await scheduleInstanceDelete(this.#instanceId, true)
    }

    async rescheduleInstance() {
        console.log('Rescheduling instance: ', this.#instanceId)
        return this.#getAllContainers()
            .then(this.#rescheduleContainers)
            .then(this.#scheduleInstanceForDeletion)
            .then(() => console.log('Instance rescheduled'))
    }
}
