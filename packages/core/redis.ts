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

async function runLuaScript(containerSlug: string, luaScript: string) {
    try {
        // Execute the script with the container slug argument using EVAL
        const result = await redisClient.eval(luaScript, {
            arguments: [containerSlug]
        })
        console.log('Result:', result)
        return result
    } catch (err) {
        console.error('Error:', err)
    }
    return null
}

export { redisClient, runLuaScript }
