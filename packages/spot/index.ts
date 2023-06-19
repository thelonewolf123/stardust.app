import { createConsumer, createQueue, getClient } from '../core/queue'

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

    await publish({ message: msg })

    setInterval(async () => {
        await publish({ message: msg })
    }, 1000)
}

async function do_consume() {
    const amqp = await getClient()
    const queue = 'test_queue'
    const consumerTag = 'myconsumer'

    if (!amqp) throw new Error('AMQP connection is missing!')
    const { channel, onMessage } = await createConsumer(amqp, { queue })

    await onMessage((msg) => {
        if (!msg) return
        console.log(msg.content.toString())
        channel.ack(msg)
    }, consumerTag)
}

do_consume()
start()
