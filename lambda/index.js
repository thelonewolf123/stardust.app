const amqplib = require('amqplib')

exports.handler = (event) => {
    console.log(event, new Date())

    if (event.detail['instance-action'] === 'terminate') {
        const instanceId = event.detail['instance-id']
        console.log('Instance is going to be terminated', instanceId)
    }

    const RABBITMQ_URL = process.env.RABBITMQ_URL
    if (!RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL environment variable is required')
    }

    amqplib.connect(RABBITMQ_URL).then((conn) => {
        return conn
            .createChannel()
            .then((ch) => {
                const q = 'spot-instance-terminate'
                const msg = JSON.stringify({
                    instanceId: event.detail['instance-id'],
                    action: event.detail['instance-action']
                })

                return ch.assertQueue(q, { durable: true }).then(() => {
                    ch.sendToQueue(q, Buffer.from(msg))
                    console.log(' [x] Sent %s', msg)
                    return ch.close()
                })
            })
            .finally(() => conn.close())
    })

    return 'Spot instance termination event processed successfully'
}
