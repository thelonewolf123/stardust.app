import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

import * as awsInfra from '../constants/aws-infra'

export const ubuntuAmi = pulumi.output(
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

export function createAmiFromInstance(instance: aws.ec2.Instance) {
    const ami = new aws.ec2.AmiFromInstance(awsInfra.EC2_AMI_NAME, {
        sourceInstanceId: instance.id.apply((id) => id),
        name: awsInfra.EC2_AMI_NAME
    })
    return ami
}
