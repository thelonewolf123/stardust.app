import * as aws from '@pulumi/aws'

import { SSM_PARAMETER_KEYS } from '../../constants/aws-infra'

export const containerBucket = new aws.s3.Bucket(
    SSM_PARAMETER_KEYS.dockerSnapshotBucket
)
