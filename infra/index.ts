import { SSM_PARAMETER_KEYS } from '../constants/aws-infra'
import { createAmiFromInstance } from './library/ami'
import { dockerCerts } from './library/docker-keystore'
import { instance } from './library/instance'
import {
    containerBucket,
    privateKeyBucket,
    remoteDockerBucket
} from './library/s3'
import { securityGroup } from './library/security-group'
import { keyPair } from './library/ssh-keystore'
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
const bucketSSM = [
    storeBucketId(containerBucket, SSM_PARAMETER_KEYS.dockerSnapshotBucket),
    storeBucketId(privateKeyBucket, SSM_PARAMETER_KEYS.ec2PrivateKeyBucket),
    storeBucketId(remoteDockerBucket, SSM_PARAMETER_KEYS.dockerKeysBucket)
]

export const amiId = ami.id
export const instanceId = instance.id
export const sshKeyName = keyPair.keyName
export const baseAmiSSMId = baseAmiSSM.id
export const keyPairSSMId = keyPairSSM.id
export const instancePublicIp = instance.publicIp
export const containerBucketId = containerBucket.id
export const securityGroupSSMId = securityGroupSSM.id
export const dockerCertsS3Ids = dockerCerts.map((cert) => cert.id)
export const bucketSSMIds = bucketSSM.map((bucket) => bucket.id)
