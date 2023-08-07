import Docker from 'dockerode'

import {
    EC2_PRIVATE_KEY_NAME,
    SSM_PARAMETER_KEYS
} from '../../../constants/aws-infra'
import s3Aws from '../../core/s3.aws'
import ssmAws from './ssm.aws'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const ec2BucketName = await ssmAws.getSSMParameter(
        SSM_PARAMETER_KEYS.ec2PrivateKeyBucket
    )
    const s3Client = s3Aws(ec2BucketName)

    const sshKeyBuffer = await s3Client.downloadFileBuffer(EC2_PRIVATE_KEY_NAME)

    const decoder = new TextDecoder('utf-8')
    const sshKey = decoder.decode(sshKeyBuffer)

    const docker = new Docker({
        protocol: 'ssh',
        port: 22,
        username: 'ubuntu',
        host: ipAddress,
        sshOptions: {
            privateKey: sshKey
        },
        version: '1.41',
        timeout: 12000_000
    } as Docker.DockerOptions & { sshOptions: { privateKey: string } })
    return docker
}

//https://github.com/apocas/dockerode/issues/621
