export type WorkerQueueMessage =
    | {
          type: 's3-backup'
      }
    | {
          type: 's3-restore'
          filename: string
      }

export type ScheduleQueueMessage =
    | {
          type: 'new-instance'
      }
    | {
          type: 'destroy-instance'
          instanceId: string
      }

export type PhysicalHostType = {
    instanceId: string
    publicIp: string
    scheduledForDeletionAt: Date | null
    createdAt: Date
    updatedAt: Date
    status: 'running' | 'pending' | 'scheduled-for-deletion'
    amiId: string
    containers: {
        containerId: string
        containerSlug: string
        updatedAt: Date
        scheduledAt: Date
        status: 'running' | 'stopped' | 'pending'
    }[]
}
