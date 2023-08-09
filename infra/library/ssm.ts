import * as aws from '@pulumi/aws'

import { SSM_PARAMETER_KEYS } from '../../constants/aws-infra'

export function storeBaseAmiId(ami: aws.ec2.Ami) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.baseAmiId, {
        name: SSM_PARAMETER_KEYS.baseAmiId,
        type: 'String',
        value: ami.id.apply((id) => id)
    })
}

export function storeSecurityGroup(securityGroup: aws.ec2.SecurityGroup) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.baseSecurityGroup, {
        name: SSM_PARAMETER_KEYS.baseSecurityGroup,
        type: 'String',
        value: securityGroup.id.apply((id) => id)
    })
}

export function storeKeyPairName(keyPair: aws.ec2.KeyPair) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.baseKeyParName, {
        name: SSM_PARAMETER_KEYS.baseKeyParName,
        type: 'String',
        value: keyPair.id.apply((id) => id)
    })
}

export function storeBucketId(bucket: aws.s3.Bucket, key: string) {
    return new aws.ssm.Parameter(key, {
        name: key,
        type: 'String',
        value: bucket.id.apply((id) => id)
    })
}

export function storeSecret(secret: string, key: string) {
    return new aws.ssm.Parameter(key, {
        name: key,
        type: 'SecureString',
        value: secret
    })
}
