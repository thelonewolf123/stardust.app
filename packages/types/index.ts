import { z } from 'zod'

import { createQueue } from '@/core/queue'
import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema
} from '@/scheduler/schema'
import { User, UserModel } from '@models/user'
import { ReturnModelType } from '@typegoose/typegoose'

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
    createContainerQueue: Awaited<
        ReturnType<typeof createQueue<z.infer<typeof ContainerSchedulerSchema>>>
    >
    destroyContainerQueue: Awaited<
        ReturnType<typeof createQueue<z.infer<typeof ContainerDestroySchema>>>
    >
    buildContainerQueue: Awaited<
        ReturnType<typeof createQueue<z.infer<typeof ContainerBuildSchema>>>
    >
}
