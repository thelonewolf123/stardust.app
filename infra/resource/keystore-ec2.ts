import * as aws from '@pulumi/aws'

import { SSH_KEY_NAME, SSM_PARAMETER_KEYS } from '../../constants/aws-infra'
import { generateSshKey } from '../utils'
import { storeSecret } from './ssm'

const sshKey = generateSshKey()

export const ec2Creds = [
    storeSecret({
        secret: sshKey.privateKey,
        key: SSM_PARAMETER_KEYS.ec2PrivateKey
    }),
    storeSecret({
        secret: sshKey.publicKey,
        key: SSM_PARAMETER_KEYS.ec2PublicKey
    })
]

export const keyPair = new aws.ec2.KeyPair(SSH_KEY_NAME, {
    publicKey: sshKey.publicKey
})
