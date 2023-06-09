// src/env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    server: {
        MONGODB_URI: z.string().url(),
        AWS_ACCESS_KEY_ID: z.string().min(1),
        AWS_ACCESS_KEY_SECRET: z.string().min(1),
        NODE_ENV: z.enum(['development', 'production']),
        DEPLOYMENT_ENV: z.enum(['local', 'aws'])
    },
    client: {},
    runtimeEnv: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,

        NODE_ENV: process.env.NODE_ENV,

        DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV
    }
})
