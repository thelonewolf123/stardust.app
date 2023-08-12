import { SSM_PARAMETER_KEYS } from '../constants/aws-infra'
import { createAmiFromInstance } from './library/ami'
import { instance } from './library/instance'
import { dockerHostPassword } from './library/keystore-docker'
import { keyPair } from './library/keystore-ssh'
import { containerBucket } from './library/s3'
import { securityGroup } from './library/security-group'
import {
    storeBaseAmiId,
    storeBucketId,
    storeKeyPairName,
    storeSecurityGroup
} from './library/ssm'

const ami = createAmiFromInstance(instance)
const baseAmiSSM = storeBaseAmiId(ami)
const keyPairSSM = storeKeyPairName(keyPair)
const securityGroupSSM = storeSecurityGroup(securityGroup)
const dockerSnapshotBucket = storeBucketId(
    containerBucket,
    SSM_PARAMETER_KEYS.dockerSnapshotBucket
)

export const amiId = ami.id
export const instanceId = instance.id
export const sshKeyName = keyPair.keyName
export const baseAmiSSMId = baseAmiSSM.id
export const keyPairSSMId = keyPairSSM.id
export const instancePublicIp = instance.publicIp
export const containerBucketId = containerBucket.id
export const securityGroupSSMId = securityGroupSSM.id
export const dockerHostPasswordId = dockerHostPassword.id
export const dockerSnapshotBucketId = dockerSnapshotBucket.id
