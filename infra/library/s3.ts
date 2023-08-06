import * as aws from '@pulumi/aws'

import * as awsInfra from '../../constants/aws-infra'

export const containerBucket = new aws.s3.Bucket(
    awsInfra.CONTAINER_SNAPSHOT_BUCKET_NAME
)
export const privateKeyBucket = new aws.s3.Bucket(
    awsInfra.PRIVATE_KEY_BUCKET_NAME
)
export const remoteDockerBucket = new aws.s3.Bucket(
    awsInfra.REMOTE_DOCKER_BUCKET_NAME
)
