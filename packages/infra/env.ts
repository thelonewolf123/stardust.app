import { configDotenv } from 'dotenv'
import { z } from 'zod'

// @ts-ignore
import { createEnv } from '@t3-oss/env-nextjs'

if (process.env.NODE_ENV === 'development') {
    configDotenv({
        path: './../../.env.local'
    })
}

export const env = createEnv({
    server: {
        MONGODB_URI: z.string().url(),

        AWS_ACCESS_KEY_ID: z.string().min(1),
        AWS_ACCESS_KEY_SECRET: z.string().min(1),
        DATABASE_NAME: z.string().min(1),
        PRIVATE_KEY_BUCKET_NAME: z.string().min(1),
        AWS_REGION: z.string().min(1),
        CONTAINER_BUCKET_NAME: z.string().min(1),
        NODE_ENV: z.enum(['development', 'production']),
        DEPLOYMENT_ENV: z.enum(['local', 'aws']),
        CHECKPOINT_PATH: z.string().min(1),
        SPOT_INSTANCE_ID: z.string().min(1),
        RABBITMQ_URL: z.string().url()
    },
    client: {},
    runtimeEnv: {
        MONGODB_URI: process.env.MONGODB_URI,
        PRIVATE_KEY_BUCKET_NAME: process.env.PRIVATE_KEY_BUCKET_NAME,
        DATABASE_NAME: process.env.DATABASE_NAME,

        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,
        AWS_REGION: process.env.AWS_REGION,
        CONTAINER_BUCKET_NAME: process.env.CONTAINER_BUCKET_NAME,
        NODE_ENV: process.env.NODE_ENV,
        DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
        CHECKPOINT_PATH: process.env.CHECKPOINT_PATH,
        SPOT_INSTANCE_ID: process.env.SPOT_INSTANCE_ID,
        RABBITMQ_URL: process.env.RABBITMQ_URL
    }
})