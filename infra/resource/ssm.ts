import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { Output } from '@pulumi/pulumi';

import { SSM_PARAMETER_KEYS } from '../../constants/aws-infra';

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

export function storeSecret(param: {
    secret: string | Output<string>
    key: string
}) {
    return new aws.ssm.Parameter(param.key, {
        name: param.key,
        type: aws.ssm.ParameterType.SecureString,
        value: param.secret
    })
}

export function storeProxyIpAddr(proxyIpAddr: Output<string>) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.proxyIpAddr, {
        name: SSM_PARAMETER_KEYS.proxyIpAddr,
        type: 'StringList',
        value: proxyIpAddr
    })
}

export function storeSpotFleetRole(role: aws.iam.Role) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.spotFleetRole, {
        name: SSM_PARAMETER_KEYS.spotFleetRole,
        type: 'String',
        value: role.arn
    })
}

export function storeUserInstanceSecurityGroup(
    securityGroup: aws.ec2.SecurityGroup
) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.userInstanceSecurityGroup, {
        name: SSM_PARAMETER_KEYS.userInstanceSecurityGroup,
        type: 'String',
        value: securityGroup.id.apply((id) => id)
    })
}

export function storeBackendURL(
    webListener: awsx.classic.lb.ApplicationListener
) {
    return new aws.ssm.Parameter(SSM_PARAMETER_KEYS.backendURL, {
        name: SSM_PARAMETER_KEYS.backendURL,
        type: 'String',
        value: webListener.endpoint.hostname
    })
}
