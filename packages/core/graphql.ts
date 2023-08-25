import { request } from 'graphql-request'
import { z } from 'zod'

import { env } from '@/env'
import { ContainerSchedulerSchema } from '@/schema'

const endpoint = env.BACKEND_BASE_URL

async function scheduleContainer(
    args: z.infer<typeof ContainerSchedulerSchema>
) {
    const query = `
        mutation ScheduleContainer($data: ContainerSchedulerSchema!) {
            scheduleContainer(data: $data) {
                containerId
                containerSlug
                status
                scheduledAt
                updatedAt
            }
            `

    const response = await request(endpoint, query, { ...args })
    return response
}
