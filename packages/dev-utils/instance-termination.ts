import { queueManager } from '../core/queue'

async function start() {
    const exchange = 'worker_exchange'
    const queue = 'local-instance-queue'
    const routingKey = 'instanceTermination'
    const msg = 's3-backup'

    const { publish, cleanup } = await queueManager({
        exchange,
        queue,
        routingKey
    })

    await publish({ type: msg })
    await cleanup()
}

start()
