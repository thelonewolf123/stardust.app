import { EventEmitter } from 'stream'

import { getPublisherType } from '@/core/utils'
import redis from '@core/redis'

export const LOGS_EMITTER = new EventEmitter()

function handleMessage(pattern: string, channel: string, message: string) {
    console.log('Received message %s from channel %s', message, channel)
    const type = getPublisherType(channel)
    const id = channel.split(':').pop()

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
        case 'CONTAINER_DEPLOYMENT_LOGS':
            handleContainerDeploymentLogMessage(message, id)
            break
        case 'GIT_CLONE_LOGS':
            handleCloneLogMessage(message, id)
            break
        default:
            console.log('Unknown type', type)
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

function handleContainerDeploymentLogMessage(message: string, id: string) {
    console.log('Container deployment log message', message)
    LOGS_EMITTER.emit('deployment', { message, id })
}

function handleCloneLogMessage(message: string, id: string) {
    console.log('Clone log message', message)
    LOGS_EMITTER.emit('clone', { message, id })
}

export async function startLogsPublisher() {
    await redis.client.psubscribe('logger:*')
    redis.client.on('pmessage', handleMessage)
}
