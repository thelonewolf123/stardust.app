import { createClient, RedisClientOptions } from 'redis'

const config: RedisClientOptions = {
    url: process.env.REDIS_HOST || 'localhost'
    // Add more configuration options here if needed.
}

const redisClient = createClient(config)

// Optional: Add error handling for the Redis client
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
})

async function runLuaScript(luaScript: string, args: string[]) {
    try {
        // Execute the script with the container slug argument using EVAL
        const result = (await redisClient.eval(luaScript, {
            arguments: args
        })) as null | string // type casting is not safe,
        console.log('Result:', result)
        return result
    } catch (err) {
        console.error('Redis Error:', err)
    }
    return null
}

export { redisClient, runLuaScript }
