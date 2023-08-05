import Docker from 'dockerode'

import { REMOTE_DOCKER_CRED } from '../../../infra/constants/aws-infra'
import { s3 } from '../../core/s3'
import { env } from '../../env'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const s3Client = s3(env.REMOTE_DOCKER_BUCKET_NAME)
    const ca = await s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.ca)
    const key = await s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.key)
    const cert = await s3Client.downloadFileBuffer(REMOTE_DOCKER_CRED.cert)

    if (!ca || !key || !cert)
        throw new Error('Failed to download docker credentials')

    const docker = new Docker({
        protocol: 'https',
        ca: ca.toString(),
        key: key.toString(),
        cert: cert.toString(),
        host: ipAddress,
        port: 2376,
        version: '1.41'
    })
    return docker
}
