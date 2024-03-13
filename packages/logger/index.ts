import { getPublisherType } from '@/core/utils'
import { LogMessageSchema } from '@/schema'
import redis from '@core/redis'

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
}

function handleContainerLogMessage(message: string, id: string) {
    console.log('Container log message', message)
}

async function startLogsCollector() {
    await redis.client.psubscribe('logger:*')
    redis.client.on('pmessage', handleMessage)
}

startLogsCollector().then(() => {
    console.log('Logger started')
})
