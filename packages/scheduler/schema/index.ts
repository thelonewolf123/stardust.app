import { z } from 'zod'

export const ContainerSchedulerSchema = z
    .object({
        containerSlug: z.string().min(1),
        image: z.string().min(1),
        command: z.array(z.string().min(1)).optional(),
        env: z.record(z.string().min(1)).optional(),
        ports: z.record(z.string().min(1), z.number()).optional()
    })
    .strict()

export const ContainerDestroySchema = z.object({
    containerId: z.string().min(1)
})
