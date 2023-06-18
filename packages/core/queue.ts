import { connect, type Connection } from 'amqplib'
import { env } from '../env'

let connection: Connection | null = null

async function getClient() {
    if (!connection) return connection
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
    return channel
}

async function createConsumer(amqp: Connection, args: { queue: string }) {
    var channel = await amqp.createChannel()
    await channel.assertQueue(args.queue, { durable: true })
    return channel
}

export { getClient, createQueue, createConsumer }
