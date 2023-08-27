import models from '@/backend/database'
import { MAX_CONTAINER_BUILD_QUEUE_ATTEMPTS } from '@constants/aws-infra'
import { CLOUD_PROVIDER } from '@constants/provider'
import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER
} from '@constants/queue'
import { createQueue, getClient, queueManager } from '@core/queue'

import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema
} from '../../schema'
import { BuildImageStrategy } from './controllers/build-image'
import { DestroyContainerStrategy } from './controllers/destroy-container'
import { NewContainerStrategy } from './controllers/new-container'

export const setupNewContainerConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: NEW_CONTAINER.EXCHANGE_NAME,
        queue: NEW_CONTAINER.QUEUE_NAME,
        routingKey: NEW_CONTAINER.ROUTING_KEY
    })
    process.on('SIGINT', () => cleanup())

    onMessage((message) => {
        if (!message) return
        const { content } = message
        const data = ContainerSchedulerSchema.parse(
            JSON.parse(content.toString())
        )
        const strategy = new NewContainerStrategy(data, CLOUD_PROVIDER)
        strategy
            .createNewContainer()
            .then(() => {
                channel.receiver.ack(message)
            })
            .catch((error) => {
                console.error('New container provision failed: ', error)
                channel.receiver.nack(message)
            })
    })
}

export const setupDestroyContainerConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: DESTROY_CONTAINER.EXCHANGE_NAME,
        queue: DESTROY_CONTAINER.QUEUE_NAME,
        routingKey: DESTROY_CONTAINER.ROUTING_KEY
    })
    process.on('SIGINT', () => cleanup())

    onMessage(async (message) => {
        if (!message) return
        const { content } = message
        const data = ContainerDestroySchema.parse(
            JSON.parse(content.toString())
        )
        console.log(data)
        const strategy = new DestroyContainerStrategy(data, CLOUD_PROVIDER)
        strategy
            .destroyContainer()
            .then(() => {
                channel.receiver.ack(message)
            })
            .catch((error) => {
                console.error(error)
                channel.receiver.nack(message)
            })
    })
}

export const setupBuildContainerConsumer = async () => {
    const { onMessage, channel, publish, cleanup } = await queueManager(
        {
            exchange: BUILD_CONTAINER.EXCHANGE_NAME,
            queue: BUILD_CONTAINER.QUEUE_NAME,
            routingKey: BUILD_CONTAINER.ROUTING_KEY
        },
        { prefetch: 1 }
    )
    process.on('SIGINT', () => cleanup())

    const client = await getClient()
    const createContainerQueue = await createQueue(client, {
        exchange: NEW_CONTAINER.EXCHANGE_NAME,
        queue: NEW_CONTAINER.QUEUE_NAME,
        routingKey: NEW_CONTAINER.ROUTING_KEY
    })

    onMessage(async (message) => {
        if (!message) return
        const { content } = message
        const data = ContainerBuildSchema.parse(JSON.parse(content.toString()))
        console.log(data)

        const container = await models.Container.findOne({
            containerSlug: data.containerSlug
        }).lean()
        const attempts = container?.containerBuildAttempts || 0

        if (MAX_CONTAINER_BUILD_QUEUE_ATTEMPTS <= attempts) {
            console.log(
                `Max container build attempts reached for ${data.containerSlug}`
            )
            return channel.receiver.ack(message)
        }

        const strategy = new BuildImageStrategy(
            data,
            createContainerQueue,
            CLOUD_PROVIDER
        )

        strategy
            .buildImage()
            .then(() => {
                channel.receiver.ack(message)
            })
            .catch((error) => {
                console.error(error)
                channel.receiver.nack(message)
            })
    })
}
