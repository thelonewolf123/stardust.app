import * as aws from '@pulumi/aws'

import * as awsInfra from '../../constants/aws-infra'
import { generateSshKey } from '../utils'
import { storeSecret } from './ssm'

const sshKey = generateSshKey()

export const ec2Creds = [
    storeSecret(sshKey.privateKey, awsInfra.EC2_PRIVATE_KEY_NAME),
    storeSecret(sshKey.publicKey, awsInfra.EC2_PUBLIC_KEY_NAME)
]

export const keyPair = new aws.ec2.KeyPair(awsInfra.SSH_KEY_NAME, {
    publicKey: sshKey.publicKey
})
