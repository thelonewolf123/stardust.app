import * as aws from '@pulumi/aws'

import { env } from '../../env'

export const containerBucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)
export const privateKeyBucket = new aws.s3.Bucket(env.PRIVATE_KEY_BUCKET_NAME)
