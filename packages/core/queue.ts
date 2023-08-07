import { connect, Connection, ConsumeMessage } from 'amqplib'
import invariant from 'invariant'

import { env } from '../env'

let connection: Connection | null = null

async function getClient() {
    if (connection) return connection
    connection = await connect(env.RABBITMQ_URL)
    return connection
}

async function createQueue(
    amqp: Connection,
    args: {
        queue: string
        routingKey: string
        exchange: string
    }
) {
    const { queue, routingKey, exchange } = args

    var channel = await amqp.createChannel()
    await channel
        .assertExchange(exchange, 'direct', { durable: true })
        .catch(console.error)
    await channel.assertQueue(queue, { durable: true })
    await channel.bindQueue(queue, exchange, routingKey)
    const publish = (message: Record<string, unknown>) => {
        return channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message))
        )
    }

    return { channel, publish }
}

async function createConsumer(amqp: Connection, args: { queue: string }) {
    var channel = await amqp.createChannel()
    await channel.assertQueue(args.queue, { durable: true })
    const onMessage = (
        fn: (msg: ConsumeMessage | null) => void,
        consumerTag?: string
    ) => {
        return channel.consume(args.queue, fn, { consumerTag })
    }
    return { channel, onMessage }
}

const queueManager = async (args: {
    queue: string
    routingKey: string
    exchange: string
}) => {
    const { queue, routingKey, exchange } = args
    const client = await getClient()
    invariant(client, 'AMQP connection missing!')
    const { channel: sender, publish } = await createQueue(client, {
        queue,
        routingKey,
        exchange
    })
    const { channel: receiver, onMessage } = await createConsumer(client, {
        queue
    })
    return {
        onMessage,
        publish,
        client,
        channel: { sender, receiver },
        cleanup: async () => {
            await sender.close()
            await receiver.close()
            await client.close()
        }
    }
}

export { getClient, createQueue, createConsumer, queueManager }
