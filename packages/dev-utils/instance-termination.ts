import { createQueue, getClient, queueManager } from '../core/queue'

async function start() {
    const exchange = 'test_exchange'
    const queue = 'local-instance-queue'
    const routingKey = 'instanceTermination'
    const msg = 's3-backup'

    const { channel, publish, client } = await queueManager({
        exchange,
        queue,
        routingKey
    })

    await publish({ type: msg })
    await channel.close()
    await client.close()
}

start()
