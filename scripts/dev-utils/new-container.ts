import { v4 } from 'uuid'
import { z } from 'zod'

import { NEW_CONTAINER } from '../../constants/queue'
import { queueManager } from '../../packages/core/queue'
import { ContainerSchedulerSchema } from '../../packages/schema/index'

async function start() {
    const exchange = NEW_CONTAINER.EXCHANGE_NAME
    const queue = NEW_CONTAINER.QUEUE_NAME
    const routingKey = NEW_CONTAINER.ROUTING_KEY
    const message: z.infer<typeof ContainerSchedulerSchema> = {
        containerSlug: 'thelonewolf123/golang-tools:0',
        image: '655959644936.dkr.ecr.us-east-1.amazonaws.com/thelonewolf123/golang-tools:1',
        ports: [8080]
    }

    const { publish, cleanup } = await queueManager({
        exchange,
        queue,
        routingKey
    })

    await publish(message)
    await cleanup()
}

start()
