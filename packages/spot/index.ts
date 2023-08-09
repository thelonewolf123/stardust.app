import { WorkerQueueMessage } from '@/types'
import { createCheckpoint, getAllContainers } from '@core/docker'
import { queueManager } from '@core/queue'

const setupListener = async () => {
    const exchange = 'worker_exchange'
    const queue = 'local-instance-queue'
    const routingKey = 'instanceTermination'

    const { onMessage, channel, cleanup } = await queueManager({
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
        const backups = await Promise.all(
            allContainer.map((id) => createCheckpoint(id))
        )
        console.log(allContainer, backups)
        channel.receiver.ack(message)
    })

    process.on('SIGINT', async () => {
        await cleanup()
        process.exit(0)
    })
}

setupListener()
