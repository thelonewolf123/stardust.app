// src/env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import { configDotenv } from 'dotenv'
if (process.env.NODE_ENV === 'development') {
    configDotenv({
        path: '../.env.local'
    })
}

export const env = createEnv({
    server: {
        MONGODB_URI: z.string().url(),

        AWS_ACCESS_KEY_ID: z.string().min(1),
        AWS_ACCESS_KEY_SECRET: z.string().min(1),
        AWS_REGION: z.string().min(1),
        CONTAINER_BUCKET_NAME: z.string().min(1),

        NODE_ENV: z.enum(['development', 'production']),
        DEPLOYMENT_ENV: z.enum(['local', 'aws']),

        RABBITMQ_URL: z.string().url()
    },
    client: {},
    runtimeEnv: {
        MONGODB_URI: process.env.MONGODB_URI,

        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,
        AWS_REGION: process.env.AWS_REGION,
        CONTAINER_BUCKET_NAME: process.env.CONTAINER_BUCKET_NAME,

        NODE_ENV: process.env.NODE_ENV,

        DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,

        RABBITMQ_URL: process.env.RABBITMQ_URL
    }
})
