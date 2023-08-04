import * as aws from '@pulumi/aws'

import { env } from '../../packages/env'

export const dockerPassword = new aws.ssm.Parameter('docker-password', {
    name: 'docker-password',
    type: 'SecureString',
    value: env.REMOTE_DOCKER_PASSWORD
})

export function storeBaseAmiId(ami: aws.ec2.Ami) {
    return new aws.ssm.Parameter('base-ami-id', {
        name: 'base-ami-id',
        type: 'String',
        value: ami.id.apply((id) => id)
    })
}
