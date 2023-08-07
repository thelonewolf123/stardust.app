import { createClient, RedisClientOptions } from 'redis'

const config: RedisClientOptions = {
    url: process.env.REDIS_HOST || 'localhost'
    // Add more configuration options here if needed.
}

const redis = createClient(config)

// Optional: Add error handling for the Redis client
redis.on('error', (err) => {
    console.error('Redis Client Error:', err)
})

const connectionPromise = redis.connect() // returns a Promise

async function runLuaScript(luaScript: string, args: string[]) {
    try {
        // Execute the script with the container slug argument using EVAL
        const result = await redis.eval(luaScript, {
            arguments: args
        })
        console.log('Result:', result)
        return result as null | string // type casting is not safe,
    } catch (err) {
        console.error('Redis Error:', err)
    }
    return null
}

export default { client: redis, runLuaScript, connect: () => connectionPromise }
