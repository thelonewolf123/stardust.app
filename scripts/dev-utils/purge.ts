import mongoose from 'mongoose'

import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER
} from '../../constants/queue'
import { queueManager } from '../../packages/core/queue'
import redis from '../../packages/core/redis'
import { env } from '../../packages/env'

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

mongoose.connect(env.MONGODB_URI).then(() => {
    console.log('Mongoose connected')
    Promise.all([
        mongoose.connection.db.collection('containers').drop(),
        mongoose.connection.db.collection('projects').drop(),
        mongoose.connection.db.collection('instances').drop()
    ])
        .then(() => {
            console.log('MongoDB purged')
            mongoose.connection.close()
        })
        .catch(() => {
            console.log('MongoDB purged')
            mongoose.connection.close()
        })
})

setTimeout(() => process.exit(), 100_000)
