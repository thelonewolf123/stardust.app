import { SSM_PARAMETER_KEYS } from '../constants/aws-infra'
import { createAmiFromInstance } from './resource/ami'
import { addDnsRecord } from './resource/cloudflare'
import { instance } from './resource/instance'
import { dockerHostPassword, keyPair } from './resource/keystore'
import { proxyCommandFn } from './resource/proxy'
import { containerBucket } from './resource/s3'
import { securityGroup } from './resource/securityGroup'
import { remoteCommand } from './resource/ssh'
import {
    storeBaseAmiId,
    storeBucketId,
    storeKeyPairName,
    storeProxyIpAddr,
    storeSecret,
    storeSecurityGroup
} from './resource/ssm'

const ami = createAmiFromInstance(instance, remoteCommand)

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
const proxySSM = storeProxyIpAddr(instance.publicIp)
const proxyCommand = proxyCommandFn(ami)
const dnsRecord = addDnsRecord(instance.publicIp)

export const amiId = ami.id
export const instanceId = instance.id
export const proxySSMId = proxySSM.id
export const dnsRecordId = dnsRecord.map((r) => r.id)
export const proxyCmdId = proxyCommand.id
export const sshKeyName = keyPair.keyName
export const baseAmiSSMId = baseAmiSSM.id
export const keyPairSSMId = keyPairSSM.id
export const ec2InstanceSSMId = ec2InstanceSSM.id
export const proxyPublicIp = instance.publicIp
export const containerBucketId = containerBucket.id
export const securityGroupSSMId = securityGroupSSM.id
export const dockerHostPasswordId = dockerHostPassword.id
export const dockerSnapshotBucketId = dockerSnapshotBucket.id

// Export the url for the service.
// export const url = webListener.endpoint.hostname

// Export the service.
// export const app = appService.urn
// export const cron = cronService.urn
// export const scheduler = schedulerService.urn
// export const logger = logsService.urn
