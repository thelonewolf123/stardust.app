import { z } from 'zod'

// name, image, command, env, ports
export const NewContainerSchema = z.object({
    name: z.string().min(1),
    image: z.string().min(1),
    command: z.string().min(1),
    env: z.record(z.string().min(1)),
    ports: z.record(z.string().min(1), z.number())
})
