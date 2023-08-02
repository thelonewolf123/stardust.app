import { z } from 'zod'

export const NewInstanceSchema = z
    .object({
        count: z.number().int().min(1),
        type: z.enum(['spot', 'on-demand'])
    })
    .strict()
