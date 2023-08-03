import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { env } from './env'
import { generateSshKey } from './library/ssh-keygen'

const bucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)

export const bucketName = bucket.id
const keyPairName = 'infra-soulbound-keypair'

const privateKey = generateSshKey()
const privateKeyBucket = new aws.s3.Bucket(env.PRIVATE_KEY_BUCKET_NAME)

export const privateKeyBucketId = privateKeyBucket.id

const privateKeyS3 = new aws.s3.BucketObject('ec2-privateKey.pem', {
    key: 'privateKey.pem',
    acl: 'private',
    bucket: bucket.id,
    content: privateKey.privateKey
})

const publicKeyS3 = new aws.s3.BucketObject('ec2-publicKey.pub', {
    key: 'publicKey.pub',
    acl: 'private',
    bucket: bucket.id,
    content: privateKey.publicKey
})

const keyPair = new aws.ec2.KeyPair(keyPairName, {
    publicKey: privateKey.publicKey
})
export const sshKeyName = keyPair.keyName

const ubuntuAmi = pulumi.output(
    aws.ec2.getAmi({
        filters: [
            {
                name: 'name',
                values: [
                    'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*'
                ]
            },
            {
                name: 'virtualization-type',
                values: ['hvm']
            }
        ],
        owners: ['099720109477'], // Canonical
        mostRecent: true
    })
)

// Create an EC2 instance
const instance = new aws.ec2.Instance('soulForgeBaseInstance', {
    ami: ubuntuAmi.apply((ami) => ami.id),
    instanceType: 't2.micro',
    keyName: keyPair.id.apply((keyName) => keyName),
    tags: {
        Name: 'soulForgeBaseInstance'
    },
    userData: `#!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io git curl
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    `
})

// Create an AMI from the instance when it is ready
const ami = instance.id.apply(
    (id) =>
        new aws.ec2.AmiFromInstance('soulForgeBaseAmi', {
            sourceInstanceId: id,
            name: 'soulForgeBaseAmi'
        })
)

export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
