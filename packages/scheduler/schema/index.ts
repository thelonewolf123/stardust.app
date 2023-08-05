import { z } from 'zod'

export const ContainerSchedulerSchema = z
    .object({
        containerSlug: z.string().min(1),
        image: z.string().min(1),
        command: z.array(z.string().min(1)),
        env: z.record(z.string().min(1)).optional(),
        ports: z.record(z.string().min(1), z.number()).optional()
    })
    .strict()

const instanceEnum = z.enum(['new-instance', 'destroy-instance'])

const NewInstanceScheduleSchema = z.object({
    type: z.literal(instanceEnum.enum['new-instance'])
})
const DestroyInstanceScheduleSchema = z.object({
    type: z.literal(instanceEnum.enum['destroy-instance']),
    instanceId: z.string().min(1)
})

export const InstanceSchedulerSchema = z.discriminatedUnion('type', [
    NewInstanceScheduleSchema,
    DestroyInstanceScheduleSchema
])
