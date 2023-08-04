import * as aws from '@pulumi/aws'

import { env } from '../../packages/env'

export const containerBucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)
export const privateKeyBucket = new aws.s3.Bucket(env.PRIVATE_KEY_BUCKET_NAME)
export const remoteDockerBucket = new aws.s3.Bucket(
    env.REMOTE_DOCKER_BUCKET_NAME
)
