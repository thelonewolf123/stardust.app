import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER
} from '../../constants/queue'
import { queueManager } from '../../packages/core/queue'
import redis from '../../packages/core/redis'

redis.connect().then(async () => {
    // purge all keys
    await redis.client.flushDb()
    await redis.client.quit()
    console.log('Redis purged')
})

const queue = [BUILD_CONTAINER, DESTROY_CONTAINER, NEW_CONTAINER]
queue.map(async (queue) => {
    const { onMessage, channel, cleanup } = await queueManager({
        exchange: queue.EXCHANGE_NAME,
        queue: queue.QUEUE_NAME,
        routingKey: queue.ROUTING_KEY
    })
    process.on('SIGINT', () => cleanup())

    onMessage((message) => {
        if (!message) return
        console.log(
            'QUEUE MESSAGE => ',
            queue.EXCHANGE_NAME,
            message.content.toString()
        )
        channel.receiver.ack(message)
    })
})

setTimeout(() => process.exit(), 100_000)
