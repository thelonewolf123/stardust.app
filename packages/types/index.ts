import { User } from './graphql-server'

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
    user: null | User
}
