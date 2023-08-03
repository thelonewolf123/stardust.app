import Redis from 'redis'

const config: Redis.RedisClientOptions = {
    url: process.env.REDIS_HOST || 'localhost'
    // Add more configuration options here if needed.
}

const redisClient = Redis.createClient(config)

// Optional: Add error handling for the Redis client
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
})

export default redisClient
