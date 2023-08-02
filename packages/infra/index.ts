import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { env } from './env'

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)

// Export the name of the bucket
export const bucketName = bucket.id
