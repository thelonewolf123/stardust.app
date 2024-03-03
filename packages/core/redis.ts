import Redis from 'ioredis'
import Redlock from 'redlock'

import { env } from '@/env'

const redis = new Redis(env.REDIS_HOST || 'localhost')
const connectionPromise = redis.connect()

// Optional: Add error handling for the Redis client

const redlock = new Redlock([redis], {
    driftFactor: 0.01, // time in ms
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200 // time in ms
})

const commandMap = new Map<string, true>()

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
        if (!commandMap.has(commandName)) {
            redis.defineCommand(commandName, {
                lua: luaScript
            })
            commandMap.set(commandName, true)
        }

        // @ts-ignore
        const command = redis[commandName] as undefined | Function
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
