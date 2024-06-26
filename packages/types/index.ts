import { Schema } from 'mongoose'
import { z } from 'zod'

import models from '@/backend/database'
import { createQueue } from '@/core/queue'
import {
    ContainerBuildSchema,
    ContainerDestroySchema,
    ContainerSchedulerSchema,
    SpotTerminateSchema
} from '@/schema'
import { User } from '@models/user'

export type WorkerQueueMessage =
    | {
          type: 's3-backup'
      }
    | {
          type: 's3-restore'
          filename: string
      }

export enum Ec2InstanceType {
    builder = 'builder',
    runner = 'runner'
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
        projectSlug?: string
        domains?: string[]
        hostPortMap?: Record<string, number>
        updatedAt: Date
        scheduledAt: Date
        status: 'running' | 'pending'
    }[]
}

export type PhysicalHostRedisType = {
    instanceId: string
    publicIp: string
    scheduledForDeletionAt: number | null
    instanceType: 'builder' | 'runner'
    createdAt: number
    updatedAt: number
    status: 'running' | 'pending' | 'failed'
    amiId: string
    containers: {
        containerId: string
        containerSlug: string
        projectSlug?: string
        domains?: string[]
        hostPortMap?: Record<string, number>
        updatedAt: number
        scheduledAt: number
        status: 'running' | 'pending'
    }[]
}

export type Context = {
    user:
        | null
        | (User & {
              _id: Schema.Types.ObjectId
          })
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

        spotTermination: Awaited<
            ReturnType<typeof createQueue<z.infer<typeof SpotTerminateSchema>>>
        >
    }
    db: typeof models
}

export type QueryablePromise<T> = Promise<T> & {
    isFulfilled: boolean
    isResolved: boolean
    isRejected: boolean
}

export type ProviderType = 'aws' | 'aws-spot'

export type InstanceExecArgs = {
    command: string
    args: string[]
    cwd?: string
    ipAddress?: string
    sudo?: boolean
    env?: Record<string, string>
    onProgress?: (progress: string) => void
}

export type PublisherType = 'BUILD_LOGS' | 'CONTAINER_LOGS'

declare global {
    namespace Express {
        interface Request {
            user?: Context['user']
        }
    }
}

export type PortBindingMap = Record<
    string,
    [{ HostIp: string; HostPort: string }]
>
