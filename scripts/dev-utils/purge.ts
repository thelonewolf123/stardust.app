import redis from '../../packages/core/redis'

redis.connect().then(async () => {
    // purge all keys
    const keys = await redis.client.flushDb()
    await redis.client.quit()
})
