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
