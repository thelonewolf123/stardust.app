import { z } from 'zod'

import models from '@/backend/database'
import { createQueue } from '@/core/queue'
import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema
} from '@/scheduler/schema'
import { User } from '@models/user'

export type WorkerQueueMessage =
    | {
          type: 's3-backup'
      }
    | {
          type: 's3-restore'
          filename: string
      }

export type PhysicalHostType = {
    instanceId: string
    publicIp: string
    scheduledForDeletionAt: Date | null
    instanceType: 'builder' | 'runner'
    createdAt: Date
    updatedAt: Date
    status: 'running' | 'pending' | 'failed'
    amiId: string
    containers: {
        containerId: string
        containerSlug: string
        updatedAt: Date
        scheduledAt: Date
        status: 'running' | 'pending'
    }[]
}

export type Context = {
    user: null | (User & { _id: string })
    queue: {
        createContainer: Awaited<
            ReturnType<
                typeof createQueue<z.infer<typeof ContainerSchedulerSchema>>
            >
        >
        destroyContainer: Awaited<
            ReturnType<
                typeof createQueue<z.infer<typeof ContainerDestroySchema>>
            >
        >
        buildContainer: Awaited<
            ReturnType<typeof createQueue<z.infer<typeof ContainerBuildSchema>>>
        >
    }
    db: typeof models
}
