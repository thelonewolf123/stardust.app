import { SSM_PARAMETER_KEYS } from '../constants/aws-infra'
import { createAmiFromInstance } from './resource/ami'
import { instance } from './resource/instance'
import { dockerHostPassword } from './resource/keystore-docker'
import { keyPair } from './resource/keystore-ec2'
import { containerBucket } from './resource/s3'
import { securityGroup } from './resource/security-group'
import {
    storeBaseAmiId,
    storeBucketId,
    storeKeyPairName,
    storeSecret,
    storeSecurityGroup
} from './resource/ssm'

const ami = createAmiFromInstance(instance)
const baseAmiSSM = storeBaseAmiId(ami)
const keyPairSSM = storeKeyPairName(keyPair)
const securityGroupSSM = storeSecurityGroup(securityGroup)
const dockerSnapshotBucket = storeBucketId(
    containerBucket,
    SSM_PARAMETER_KEYS.dockerSnapshotBucket
)
const ec2InstanceSSM = storeSecret({
    secret: instance.id,
    key: SSM_PARAMETER_KEYS.dockerBuildInstanceId
})

export const amiId = ami.id
export const instanceId = instance.id
export const sshKeyName = keyPair.keyName
export const baseAmiSSMId = baseAmiSSM.id
export const keyPairSSMId = keyPairSSM.id
export const ec2InstanceSSMId = ec2InstanceSSM.id
export const instancePublicIp = instance.publicIp
export const containerBucketId = containerBucket.id
export const securityGroupSSMId = securityGroupSSM.id
export const dockerHostPasswordId = dockerHostPassword.id
export const dockerSnapshotBucketId = dockerSnapshotBucket.id
