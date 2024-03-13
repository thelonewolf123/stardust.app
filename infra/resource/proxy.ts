import * as aws from '@pulumi/aws'
import * as command from '@pulumi/command'

import * as awsInfra from '../../constants/aws-infra'
import { env } from '../../packages/env'
import { ec2ProxyUserData } from '../scripts'
import { instance } from './instance'

export const proxyCommandFn = (ami: aws.ec2.Ami) =>
    new command.remote.Command(
        'proxy',
        {
            connection: {
                host: instance.publicIp,
                user: awsInfra.EC2_INSTANCE_USERNAME,
                privateKey: env.EC2_PRIVATE_KEY
            },
            create: ec2ProxyUserData
        },
        {
            dependsOn: [ami]
        }
    )
