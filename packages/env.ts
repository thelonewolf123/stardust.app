import { configDotenv } from 'dotenv'
import path from 'path'
import { z } from 'zod'

// @ts-ignore
import { createEnv } from '@t3-oss/env-nextjs'

if (process.env.NODE_ENV === 'development') {
    configDotenv({
        path: path.join(
            process.env.PROJECT_ROOT || '/Users/harish/Work/soul-forge', // edit based on your system path
            './.env.local'
        )
    })
}

export const serverEnvSchema = {
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_ACCESS_KEY_SECRET: z.string().min(1),
    AWS_ACCOUNT_ID: z.string().min(1),
    AWS_REGION: z.string().min(1),
    BRANCH: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DEPLOYMENT_ENV: z.enum(['local', 'aws']),
    GITHUB_TOKEN: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    MONGODB_URI: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']),
    RABBITMQ_URL: z.string().url(),
    REDIS_HOST: z.string().min(1),
    REMOTE_DOCKER_PASSWORD: z.string().min(1),
    EC2_PRIVATE_KEY: z.string().min(1).optional(),
    EC2_PUBLIC_KEY: z.string().min(1).optional()
}

export const env = createEnv({
    server: serverEnvSchema,
    client: {},
    runtimeEnv: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,
        AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
        AWS_REGION: process.env.AWS_REGION,
        BRANCH: process.env.BRANCH,
        DATABASE_NAME: process.env.DATABASE_NAME,
        DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        JWT_SECRET: process.env.JWT_SECRET,
        MONGODB_URI: process.env.MONGODB_URI,
        NODE_ENV: process.env.NODE_ENV,
        RABBITMQ_URL: process.env.RABBITMQ_URL,
        REDIS_HOST: process.env.REDIS_HOST,
        REMOTE_DOCKER_PASSWORD: process.env.REMOTE_DOCKER_PASSWORD,
        EC2_PRIVATE_KEY: process.env.EC2_PRIVATE_KEY,
        EC2_PUBLIC_KEY: process.env.EC2_PUBLIC_KEY
    }
})
