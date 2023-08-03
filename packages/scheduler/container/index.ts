import { queueManager } from '../../core/queue'
import {
    SCHEDULER_CONTAINER_EXCHANGE_NAME,
    SCHEDULER_CONTAINER_QUEUE_NAME,
    SCHEDULER_CONTAINER_ROUTING_KEY
} from '../constants'
import { NewContainerSchedulerSchema } from '../schema'

export const setupContainerConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: SCHEDULER_CONTAINER_EXCHANGE_NAME,
        queue: SCHEDULER_CONTAINER_QUEUE_NAME,
        routingKey: SCHEDULER_CONTAINER_ROUTING_KEY
    })

    await onMessage(async (message) => {
        if (!message) return
        const { content } = message
        const data = NewContainerSchedulerSchema.parse(
            JSON.parse(content.toString())
        )
        console.log(data)
        channel.receiver.ack(message)
    })

    process.on('SIGINT', async () => {
        await cleanup()
        process.exit(0)
    })
}
