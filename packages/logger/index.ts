import redis from '@core/redis'

async function logger() {
    await redis.connect()
    await redis.client.psubscribe('logger:*')
    redis.client.on('pmessage', (pattern, channel, message) => {
        console.log('Received message %s from channel %s', message, channel)
    })
}

logger().then(() => {
    console.log('Logger started')
})
