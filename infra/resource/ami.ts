import * as aws from '@pulumi/aws'

import * as awsInfra from '../../constants/aws-infra'
import { getArchLinuxAmiId } from '../utils'
import { regionName } from './region'

export const ubuntuAmi = aws.ec2.getAmi({
    filters: [
        {
            name: 'name',
            values: ['ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*']
        },
        {
            name: 'virtualization-type',
            values: ['hvm']
        }
    ],
    owners: ['099720109477'], // Canonical
    mostRecent: true
})

export const amznAmi = aws.ec2.getAmi({
    mostRecent: true,
    filters: [
        {
            name: 'name',
            values: ['amzn2-ami-hvm-*-x86_64-gp2']
        }
    ],
    owners: ['amazon'] // This is the AWS account ID for Amazon-provided AMIs
})

export const archAmi = regionName
    .then((region) => {
        return getArchLinuxAmiId(region)
    })
    .then((amiId) => {
        return aws.ec2.getAmi({
            filters: [
                {
                    name: 'image-id',
                    values: [amiId]
                }
            ],
            mostRecent: true
        })
    })

export function createAmiFromInstance(instance: aws.ec2.Instance) {
    const ami = new aws.ec2.AmiFromInstance(awsInfra.EC2_AMI_NAME, {
        sourceInstanceId: instance.id.apply((id) => id),
        name: awsInfra.EC2_AMI_NAME
    })
    return ami
}

export const getAmi = (distro?: 'arch' | 'amzn' | 'ubuntu') => {
    if (distro === 'arch') {
        return archAmi
    }
    if (distro === 'amzn') {
        return amznAmi
    }
    // default to ubuntu
    return ubuntuAmi
}
