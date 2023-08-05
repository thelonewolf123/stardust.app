import { queueManager } from '../../core/queue'
import { DESTROY_CONTAINER, NEW_CONTAINER } from '../constants'
import { ContainerSchedulerSchema } from '../schema'
import { createNewContainer } from './controller'

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
        createNewContainer(data)
        console.log(data)
        channel.receiver.ack(message)
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
        const data = ContainerSchedulerSchema.parse(
            JSON.parse(content.toString())
        )
        console.log(data)
        channel.receiver.ack(message)
    })
}
