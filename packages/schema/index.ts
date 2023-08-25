import { z } from 'zod'

export const ContainerSchedulerSchema = z
    .object({
        containerSlug: z.string().min(1),
        image: z.string().min(1),
        command: z.array(z.string().min(1)).optional(),
        env: z.record(z.string().min(1)).optional(),
        ports: z.array(z.number().min(0).max(65535)).optional()
    })
    .strict()

export const ContainerDestroySchema = z.object({
    containerId: z.string().min(1)
})

export const ContainerBuildSchema = z.object({
    containerSlug: z.string().min(1),
    projectSlug: z.string().min(1),
    githubRepoUrl: z.string().min(1),
    githubRepoBranch: z.string().min(1),
    dockerContext: z.string().min(1),
    dockerPath: z.string().min(1),
    ecrRepo: z.string().min(1),
    version: z.number().min(0),
    buildArgs: z.record(z.string()).optional()
})
