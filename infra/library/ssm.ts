import * as aws from '@pulumi/aws'

import { env } from '../../packages/env'

export function storeBaseAmiId(ami: aws.ec2.Ami) {
    return new aws.ssm.Parameter('base-ami-id', {
        name: 'base-ami-id',
        type: 'String',
        value: ami.id.apply((id) => id)
    })
}
