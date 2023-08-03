import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { env } from '../env'
import * as awsInfra from './constants/aws-infra'
import { ubuntuAmi } from './library/instance'
import { securityGroup } from './library/security-group'
import { keyPair } from './library/ssh-keystore'

const containerBucket = new aws.s3.Bucket(env.CONTAINER_BUCKET_NAME)

const instance = new aws.ec2.Instance(awsInfra.EC2_INSTANCE_NAME, {
    ami: ubuntuAmi.apply((ami) => ami.id),
    instanceType: awsInfra.EC2_INSTANCE_TYPE,
    keyName: keyPair.id.apply((keyName) => keyName),
    vpcSecurityGroupIds: [securityGroup.id.apply((id) => id)],
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

export const bucketName = containerBucket.id
export const sshKeyName = keyPair.keyName
export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
