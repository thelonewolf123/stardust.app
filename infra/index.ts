import { createAmiFromInstance } from './library/ami'
import { dockerCerts } from './library/docker-keystore'
import { instance } from './library/instance'
import { containerBucket } from './library/s3'
import { securityGroup } from './library/security-group'
import { keyPair } from './library/ssh-keystore'
import {
    storeBaseAmiId,
    storeKeyPairName,
    storeSecurityGroup
} from './library/ssm'

const ami = createAmiFromInstance(instance)
const baseAmiSSM = storeBaseAmiId(ami)
const keyPairSSM = storeKeyPairName(keyPair)
const securityGroupSSM = storeSecurityGroup(securityGroup)

export const baseAmiSSMId = baseAmiSSM.id
export const keyPairSSMId = keyPairSSM.id
export const securityGroupSSMId = securityGroupSSM.id
export const dockerCertsS3Ids = dockerCerts.map((cert) => cert.id)
export const containerBucketId = containerBucket.id
export const sshKeyName = keyPair.keyName
export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
