import { queueManager } from '../../core/queue'
import {
    SCHEDULER_INSTANCE_EXCHANGE_NAME,
    SCHEDULER_INSTANCE_QUEUE_NAME,
    SCHEDULER_INSTANCE_ROUTING_KEY
} from '../constants'
import { InstanceSchedulerSchema } from '../schema'

export const setupInstanceConsumer = async () => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: SCHEDULER_INSTANCE_EXCHANGE_NAME,
        queue: SCHEDULER_INSTANCE_QUEUE_NAME,
        routingKey: SCHEDULER_INSTANCE_ROUTING_KEY
    })
    process.on('SIGINT', () => cleanup())

    onMessage(async (message) => {
        if (!message) return
        const { content } = message
        const data = InstanceSchedulerSchema.parse(
            JSON.parse(content.toString())
        )
        console.log(data)
        channel.receiver.ack(message)
    })
}
