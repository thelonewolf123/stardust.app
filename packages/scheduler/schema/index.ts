import { z } from 'zod'

export const NewContainerSchedulerSchema = z
    .object({
        name: z.string().min(1),
        image: z.string().min(1),
        command: z.array(z.string().min(1)),
        env: z.record(z.string().min(1)),
        ports: z.record(z.string().min(1), z.number())
    })
    .strict()

// export const NewInstanceSchedulerSchema = z.object({})
