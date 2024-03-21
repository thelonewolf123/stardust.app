import Redis from 'ioredis'
import Redlock from 'redlock'

import { env } from '@/env'
import { PublisherType } from '@/types'

import { getPublisherName } from './utils'

const redis = new Redis(env.REDIS_HOST)

const redlock = new Redlock([redis], {
    driftFactor: 0.01, // time in ms
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200 // time in ms
})

const commandMap = new Map<string, true>()

async function runLuaScript(
    cmd: string,
    lua: string,
    args: (string | undefined)[]
) {
    try {
        if (!commandMap.has(cmd)) {
            redis.defineCommand(cmd, {
                lua: lua,
                numberOfKeys: 0
            })
            commandMap.set(cmd, true)
        }

        // @ts-ignore
        if (typeof redis[cmd] === 'function') {
            // @ts-ignore
            return await redis[cmd](...args)
        }
    } catch (err) {
        console.error('Redis Error:', err)
    }

    return null
}

const getPublisher = (type: PublisherType, id: string) => {
    const channel = getPublisherName(type, id)
    return {
        publish: (msg: string) => {
            const message = JSON.stringify({
                timestamp: Date.now(),
                message: msg
            })
            redis.publish(channel, message)
        }
    }
}

export default {
    client: redis,
    runLuaScript,
    connect: () => Promise.resolve(true)
}

export { redlock, getPublisher }
