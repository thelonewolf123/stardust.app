import { createConsumer, createQueue, getClient } from '../core/queue'

async function start() {
    const exchange = 'test_exchange'
    const queue = 'test_queue'
    const routingKey = 'test_route'
    const msg = 'Hello World!'

    const amqp = await getClient()
    if (!amqp) throw new Error('AMQP connection is missing!')

    const channel = await createQueue(amqp, { exchange, queue, routingKey })
    await channel.publish(exchange, routingKey, Buffer.from(msg))

    setInterval(async () => {
        await channel.publish(
            exchange,
            routingKey,
            Buffer.from(`${msg} ${new Date()}`)
        )
    }, 1000)
}

async function do_consume() {
    const amqp = await getClient()
    const queue = 'test_queue'
    if (!amqp) throw new Error('AMQP connection is missing!')
    const channel = await createConsumer(amqp, { queue })
    await channel.consume(
        queue,
        (msg) => {
            if (!msg) return
            console.log(msg.content.toString())
            channel.ack(msg)
        },
        { consumerTag: 'myconsumer' }
    )
}

do_consume()
start()
