import Redis from 'ioredis'
import { createClient, RedisClientOptions } from 'redis'
import Redlock from 'redlock'

import { env } from '@/env'

const config: RedisClientOptions = {
    url: env.REDIS_HOST || 'localhost'
    // Add more configuration options here if needed.
}

const redis = createClient(config)
const redisRedlock = new Redis(config.url || 'localhost')

// Optional: Add error handling for the Redis client
redis.on('error', (err) => {
    console.error('Redis Client Error:', err)
})

const redlock = new Redlock([redisRedlock], {
    driftFactor: 0.01, // time in ms
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200 // time in ms
})

const connectionPromise = redis.connect() // returns a Promise
const commandMap = new Map<string, string>()

async function runLuaScript(
    commandName: string,
    luaScript: string,
    args: (string | undefined)[]
) {
    try {
        // Execute the script with the container slug argument using EVAL
        // const result = await redis.eval(luaScript, {
        //     arguments: args.map((arg) => arg || '')
        // })

        let result = null
        redisRedlock.defineCommand(commandName, {
            lua: luaScript
        })
        commandMap.set(commandName, luaScript)
        // @ts-ignore
        const command = redisRedlock[commandName] as undefined | Function
        if (command) {
            result = await command(...args)
        }
        return result as null | string // type casting is not safe,
    } catch (err) {
        console.error('Redis Error:', err)
    }
    return null
}

export default {
    client: redis,
    runLuaScript,
    connect: () => connectionPromise
}

export { redlock }
