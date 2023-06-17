import { connect } from 'amqplib'

async function start() {
    const client = await connect(process.env.RABBITMQ_URL || '')
    var ch = await client.createChannel()
    var exch = 'test_exchange'
    var q = 'test_queue'
    var rkey = 'test_route'
    var msg = 'Hello World!'
    await ch
        .assertExchange(exch, 'direct', { durable: true })
        .catch(console.error)
    await ch.assertQueue(q, { durable: true })
    await ch.bindQueue(q, exch, rkey)
    await ch.publish(exch, rkey, Buffer.from(msg))

    setTimeout(function () {
        ch.close()
        client.close()
    }, 500)
}

async function do_consume() {
    var conn = await connect(process.env.RABBITMQ_URL || '', 'heartbeat=60')
    var ch = await conn.createChannel()
    var q = 'test_queue'
    await conn.createChannel()
    await ch.assertQueue(q, { durable: true })
    await ch.consume(
        q,
        function (msg) {
            if (!msg) return
            console.log(msg.content.toString())
            ch.ack(msg)
            ch.cancel('myconsumer')
        },
        { consumerTag: 'myconsumer' }
    )
    setTimeout(function () {
        ch.close()
        conn.close()
    }, 500)
}

do_consume()
start()
