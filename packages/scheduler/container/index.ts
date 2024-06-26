import models from '@/backend/database'
import {
    MAX_CONTAINER_BUILD_QUEUE_ATTEMPTS,
    MAX_CONTAINER_DEPLOY_QUEUE_ATTEMPTS,
    MAX_CONTAINER_TERMINATE_QUEUE_ATTEMPTS
} from '@constants/aws-infra'
import { CLOUD_PROVIDER } from '@constants/provider'
import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER,
    SPOT_INSTANCE_TERMINATE
} from '@constants/queue'
import { createQueue, getClient, queueManager } from '@core/queue'

import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema,
    SpotTerminateSchema
} from '../../schema'
import { BuildImageStrategy } from './controllers/build-image'
import { DestroyContainerStrategy } from './controllers/destroy-container'
import { NewContainerStrategy } from './controllers/new-container'
import { SpotTerminateStrategy } from './controllers/spot-terminate'

export const setupNewContainerConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: NEW_CONTAINER.EXCHANGE_NAME,
        queue: NEW_CONTAINER.QUEUE_NAME,
        routingKey: NEW_CONTAINER.ROUTING_KEY
    })
    process.on('SIGINT', () => cleanup())

    onMessage(async (message) => {
        if (!message) return
        const { content } = message
        const data = ContainerSchedulerSchema.parse(
            JSON.parse(content.toString())
        )
        console.log(data)

        const container = await models.Container.findOne({
            containerSlug: data.containerSlug
        }).lean()
        const attempts = container?.containerDeployAttempts || 0

        if (MAX_CONTAINER_DEPLOY_QUEUE_ATTEMPTS <= attempts) {
            console.log(
                `Max container deploy attempts reached for ${data.containerSlug}`
            )
            await models.Container.updateOne(
                { containerSlug: data.containerSlug },
                { $set: { status: 'failed' } }
            )
            return channel.receiver.ack(message)
        } else {
            await models.Container.updateOne(
                { containerSlug: data.containerSlug },
                { $inc: { containerDeployAttempts: 1 } }
            )
        }

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

        const container = await models.Container.findOne({
            containerId: data.containerId
        }).lean()
        const attempts = container?.containerTerminateAttempts || 0

        if (MAX_CONTAINER_TERMINATE_QUEUE_ATTEMPTS <= attempts) {
            console.log(
                `Max container terminate attempts reached for ${data.containerId}`
            )

            await models.Container.updateOne(
                { containerId: data.containerId },
                { $set: { status: 'failed' } }
            )

            return channel.receiver.ack(message)
        } else {
            await models.Container.updateOne(
                { containerId: data.containerId },
                { $inc: { containerTerminateAttempts: 1 } }
            )
        }

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

            await models.Container.updateOne(
                { containerSlug: data.containerSlug },
                { $set: { status: 'failed' } }
            )

            return channel.receiver.ack(message)
        } else {
            await models.Container.updateOne(
                { containerSlug: data.containerSlug },
                { $inc: { containerBuildAttempts: 1 } }
            )
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

export const setupSpotInstanceTerminateConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: SPOT_INSTANCE_TERMINATE.EXCHANGE_NAME,
        queue: SPOT_INSTANCE_TERMINATE.QUEUE_NAME,
        routingKey: SPOT_INSTANCE_TERMINATE.ROUTING_KEY
    })
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
        const data = SpotTerminateSchema.parse(JSON.parse(content.toString()))
        console.log(data)

        const strategy = new SpotTerminateStrategy(
            data.instanceId,
            createContainerQueue
        )
        strategy
            .rescheduleInstance()
            .then(() => {
                channel.receiver.ack(message)
            })
            .catch((error) => {
                console.error(error)
                channel.receiver.ack(message) // Acknowledge the message to prevent reprocessing
            })
    })
}
