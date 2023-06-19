import { createQueue, getClient } from '../core/queue'

async function start() {
    const exchange = 'test_exchange'
    const queue = 'test_queue'
    const routingKey = 'test_route'
    const msg = 'Hello World!'

    const amqp = await getClient()
    if (!amqp) throw new Error('AMQP connection is missing!')

    const { channel, publish } = await createQueue(amqp, {
        exchange,
        queue,
        routingKey
    })

    await publish({ instanceId: msg })
}
