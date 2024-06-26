import * as aws from '@pulumi/aws'

import * as awsInfra from '../../constants/aws-infra'
import { getAmi } from './ami'
import { keyPair } from './keystore'
import { securityGroup } from './securityGroup'

export const instance = new aws.ec2.Instance(
    awsInfra.EC2_INSTANCE_NAME,
    {
        ami: getAmi('ubuntu').then((ami) => ami.id),
        instanceType: awsInfra.EC2_INSTANCE_TYPE,
        keyName: keyPair.id.apply((keyName) => keyName),
        vpcSecurityGroupIds: [securityGroup.id.apply((id) => id)],
        tags: {
            Name: awsInfra.EC2_INSTANCE_NAME
        }
    },
    {
        // replaceOnChanges: ['*']
    }
)
