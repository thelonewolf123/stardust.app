import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

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
