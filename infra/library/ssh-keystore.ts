import * as aws from '@pulumi/aws'

import * as awsInfra from '../constants/aws-infra'
import { generateSshKey } from '../utils'
import { privateKeyBucket } from './s3'

const privateKey = generateSshKey()

export const privateKeyBucketId = privateKeyBucket.id

new aws.s3.BucketObject(awsInfra.EC2_PRIVATE_KEY_NAME, {
    key: awsInfra.EC2_PRIVATE_KEY_NAME,
    acl: 'private',
    bucket: privateKeyBucket.id,
    content: privateKey.privateKey
})

new aws.s3.BucketObject(awsInfra.EC2_PUBLIC_KEY_NAME, {
    key: awsInfra.EC2_PUBLIC_KEY_NAME,
    acl: 'private',
    bucket: privateKeyBucket.id,
    content: privateKey.publicKey
})

export const keyPair = new aws.ec2.KeyPair(awsInfra.SSH_KEY_NAME, {
    publicKey: privateKey.publicKey
})
