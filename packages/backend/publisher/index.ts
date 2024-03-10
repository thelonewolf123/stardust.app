import { EventEmitter } from 'stream'

import { getPublisherType } from '@/core/utils'
import { LogMessageSchema } from '@/schema'
import redis from '@core/redis'

export const LOGS_EMITTER = new EventEmitter()

function handleMessage(pattern: string, channel: string, message: string) {
    console.log('Received message %s from channel %s', message, channel)
    try {
        const msgObject = JSON.parse(message)
        LogMessageSchema.parse(msgObject) // Validate message
        const [_, ch, slug, version] = channel.split(':')
        const id = `${slug}:${version}`
        const type = getPublisherType(ch)

        if (!id) {
            console.log('No id found in channel', channel)
            return
        }
        switch (type) {
            case 'BUILD_LOGS':
                handleBuildLogMessage(message, id)
                break
            case 'CONTAINER_LOGS':
                handleContainerLogMessage(message, id)
                break
            default:
                console.log('Unknown type', type)
        }
    } catch (e) {
        console.log('Invalid message', message)
    }
}

function handleBuildLogMessage(message: string, id: string) {
    console.log('Build log message', message)
    LOGS_EMITTER.emit('build', { message, id })
}

function handleContainerLogMessage(message: string, id: string) {
    console.log('Container log message', message)
    LOGS_EMITTER.emit('container', { message, id })
}

export async function startLogsPublisher() {
    await redis.client.psubscribe('logger:*')
    redis.client.on('pmessage', handleMessage)
}
