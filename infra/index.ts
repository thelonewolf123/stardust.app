import exp from 'constants'

import { createAmiFromInstance } from './library/ami'
import { dockerCerts } from './library/docker-keystore'
import { instance } from './library/instance'
import { containerBucket } from './library/s3'
import { keyPair } from './library/ssh-keystore'
import { storeBaseAmiId } from './library/ssm'

const ami = createAmiFromInstance(instance)
const baseAmiSSM = storeBaseAmiId(ami)

export const baseAmiSSMId = baseAmiSSM.id
export const dockerCertsS3Ids = dockerCerts.map((cert) => cert.id)
export const bucketName = containerBucket.id
export const sshKeyName = keyPair.keyName
export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
