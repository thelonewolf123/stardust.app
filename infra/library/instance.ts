import * as aws from '@pulumi/aws'

import * as awsInfra from '../constants/aws-infra'
import { ubuntuAmi } from './ami'
import { ec2UserData } from './script'
import { securityGroup } from './security-group'
import { keyPair } from './ssh-keystore'

export const instance = new aws.ec2.Instance(awsInfra.EC2_INSTANCE_NAME, {
    ami: ubuntuAmi.apply((ami) => ami.id),
    instanceType: awsInfra.EC2_INSTANCE_TYPE,
    keyName: keyPair.id.apply((keyName) => keyName),
    vpcSecurityGroupIds: [securityGroup.id.apply((id) => id)],
    tags: {
        Name: awsInfra.EC2_INSTANCE_NAME
    },
    userData: ec2UserData
})
