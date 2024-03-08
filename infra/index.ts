import { SSM_PARAMETER_KEYS } from '../constants/aws-infra'
import { webListener } from './resource/alb'
import { createAmiFromInstance } from './resource/ami'
import {
    appService,
    cronService,
    logsService,
    schedulerService
} from './resource/fargate'
import { instance } from './resource/instance'
import { dockerHostPassword, keyPair } from './resource/keystore'
import { containerBucket } from './resource/s3'
import { securityGroup } from './resource/securityGroup'
import { remoteCommand } from './resource/ssh'
import {
    storeBaseAmiId,
    storeBucketId,
    storeKeyPairName,
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

// Export the url for the service.
export const url = webListener.endpoint.hostname

// Export the service.
export const app = appService.urn
export const cron = cronService.urn
export const scheduler = schedulerService.urn
export const logger = logsService.urn
