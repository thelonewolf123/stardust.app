import { createAmiFromInstance } from './library/ami'
import { instance } from './library/instance'
import { containerBucket } from './library/s3'
import { keyPair } from './library/ssh-keystore'

const ami = createAmiFromInstance(instance)

export const bucketName = containerBucket.id
export const sshKeyName = keyPair.keyName
export const amiId = ami.id
export const instanceId = instance.id
export const instancePublicIp = instance.publicIp
