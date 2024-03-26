const amqplib = require('amqplib')

exports.handler = async (event) => {
    console.log(event, new Date())

    if (event.detail['instance-action'] === 'terminate') {
        const instanceId = event.detail['instance-id']
        console.log('Instance is going to be terminated', instanceId)

        const RABBITMQ_URL = process.env.RABBITMQ_URL
        if (!RABBITMQ_URL) {
            throw new Error('RABBITMQ_URL environment variable is required')
        }

        const conn = await amqplib.connect(RABBITMQ_URL)
        const ch = await conn.createChannel()
        const q = 'spot-instance-terminate'
        const msg = JSON.stringify({
            instanceId: event.detail['instance-id'],
            action: event.detail['instance-action']
        })
        await ch.assertQueue(q, { durable: true })
        ch.sendToQueue(q, Buffer.from(msg))
        console.log(' [x] Sent %s', msg)
        await ch.close()
        await conn.close()
        return 'Spot instance termination event processed successfully'
    } else {
        console.log(
            'Instance is not going to be terminated',
            event.detail['instance-id']
        )
    }
}
