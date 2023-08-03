import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { env } from '../../env'
import * as awsInfra from '../constants/aws-infra'
import { generateSshKey } from '../utils'

const privateKey = generateSshKey()
const privateKeyBucket = new aws.s3.Bucket(env.PRIVATE_KEY_BUCKET_NAME)

export const privateKeyBucketId = privateKeyBucket.id

new aws.s3.BucketObject(awsInfra.EC2_PRIVATE_KEY_NAME, {
    key: 'privateKey.pem',
    acl: 'private',
    bucket: privateKeyBucket.id,
    content: privateKey.privateKey
})

new aws.s3.BucketObject(awsInfra.EC2_PUBLIC_KEY_NAME, {
    key: 'publicKey.pub',
    acl: 'private',
    bucket: privateKeyBucket.id,
    content: privateKey.publicKey
})

export const keyPair = new aws.ec2.KeyPair(awsInfra.SSH_KEY_NAME, {
    publicKey: privateKey.publicKey
})
