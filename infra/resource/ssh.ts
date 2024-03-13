import * as command from '@pulumi/command'

import * as awsInfra from '../../constants/aws-infra'
import { env } from '../../packages/env'
import { ec2UserData } from '../scripts'
import { instance } from './instance'

export const remoteCommand = new command.remote.Command(
    'docker-init',
    {
        connection: {
            host: instance.publicIp,
            user: awsInfra.EC2_INSTANCE_USERNAME,
            privateKey: env.EC2_PRIVATE_KEY
        },
        create: ec2UserData
    },
    {
        dependsOn: [instance] // ensure the EC2 instance is created before running the command
    }
)
