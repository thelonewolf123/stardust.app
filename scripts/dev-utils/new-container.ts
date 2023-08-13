import { nanoid } from 'nanoid'
import { z } from 'zod'

import { NEW_CONTAINER } from '../../constants/queue'
import { queueManager } from '../../packages/core/queue'
import { ContainerSchedulerSchema } from '../../packages/scheduler/schema/index'

async function start() {
    const exchange = NEW_CONTAINER.EXCHANGE_NAME
    const queue = NEW_CONTAINER.QUEUE_NAME
    const routingKey = NEW_CONTAINER.ROUTING_KEY
    const message: z.infer<typeof ContainerSchedulerSchema> = {
        containerSlug: nanoid(),
        image: 'docker.io/library/alpine',
        command: ['echo', 'hello']
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
