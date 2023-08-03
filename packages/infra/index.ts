import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import * as awsInfra from './constants/aws-infra'
import { env } from './env'
import { generateSshKey } from './library/ssh-keygen'

const bucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)
export const bucketName = bucket.id

const privateKey = generateSshKey()
const privateKeyBucket = new aws.s3.Bucket(env.PRIVATE_KEY_BUCKET_NAME)

export const privateKeyBucketId = privateKeyBucket.id

new aws.s3.BucketObject(awsInfra.EC2_PRIVATE_KEY_NAME, {
    key: 'privateKey.pem',
    acl: 'private',
    bucket: bucket.id,
    content: privateKey.privateKey
})

new aws.s3.BucketObject(awsInfra.EC2_PUBLIC_KEY_NAME, {
    key: 'publicKey.pub',
    acl: 'private',
    bucket: bucket.id,
    content: privateKey.publicKey
})

const keyPair = new aws.ec2.KeyPair(awsInfra.SSH_KEY_NAME, {
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

const securityGroup = new aws.ec2.SecurityGroup(
    awsInfra.EC2_SECURITY_GROUP_NAME,
    {
        description: 'Allow inbound traffic on ports 22, 80, 443'
    }
)

for (const port of [22, 80, 443]) {
    new aws.ec2.SecurityGroupRule(`sgRule${port}`, {
        type: 'ingress',
        fromPort: port,
        toPort: port,
        protocol: 'tcp',
        securityGroupId: securityGroup.id,
        cidrBlocks: ['0.0.0.0/0']
    })
}
const instance = new aws.ec2.Instance(awsInfra.EC2_INSTANCE_NAME, {
    ami: ubuntuAmi.apply((ami) => ami.id),
    instanceType: awsInfra.EC2_INSTANCE_TYPE,
    keyName: keyPair.id.apply((keyName) => keyName),
    vpcSecurityGroupIds: [securityGroup.id],
    tags: {
        Name: awsInfra.EC2_INSTANCE_NAME
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
        new aws.ec2.AmiFromInstance(awsInfra.EC2_AMI_NAME, {
            sourceInstanceId: id,
            name: awsInfra.EC2_AMI_NAME
        })
)

export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
