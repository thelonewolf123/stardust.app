import { queueManager } from '../core/queue'
import { WorkerQueueMessage } from '../types'
import { createCheckpoint, getAllContainers } from './docker'

const setupListener = async () => {
    const exchange = 'worker_exchange'
    const queue = 'local-instance-queue'
    const routingKey = 'instanceTermination'

    const { onMessage, channel } = await queueManager({
        exchange,
        queue,
        routingKey
    })

    await onMessage(async (message) => {
        if (!message) return
        const data: WorkerQueueMessage = JSON.parse(message.content.toString())
        if (data.type !== 's3-backup') return
        console.log('container backup')
        const allContainer = await getAllContainers()
        await Promise.all(allContainer.map((id) => createCheckpoint(id)))
        console.log(allContainer)
        channel.receiver.ack(message)
    })
}

setupListener()
