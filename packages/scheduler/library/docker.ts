import Docker from 'dockerode'
import invariant from 'invariant'

import {
    REMOTE_DOCKER_CRED,
    SSM_PARAMETER_KEYS
} from '../../../constants/aws-infra'
import s3Aws from '../../core/s3.aws'
import ssmAws from './ssm.aws'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const remoteDockerBucketName = await ssmAws.getSSMParameter(
        SSM_PARAMETER_KEYS.dockerKeysBucket
    )
    const s3Client = s3Aws(remoteDockerBucketName)

    const [ca, key, cert] = await Promise.all([
        s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.ca),
        s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.key),
        s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.cert)
    ])

    invariant(ca && key && cert, 'Failed to download docker credentials')

    const docker = new Docker({
        protocol: 'https',
        ca: ca.toString(),
        key: key.toString(),
        cert: cert.toString(),
        host: ipAddress,
        port: 2376,
        version: 'v1.33'
    })
    return docker
}
