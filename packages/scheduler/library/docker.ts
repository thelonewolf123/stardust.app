import Docker from 'dockerode'

import { REMOTE_DOCKER_CRED } from '@constants/aws-infra'
import ssmAws from '@core/ssm.aws'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const [ca, key, cert] = await Promise.all([
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.ca, true),
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.key, true),
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.cert, true)
    ])

    const docker = new Docker({
        protocol: 'https',
        ca: ca,
        key: key,
        cert: cert,
        host: ipAddress,
        port: 2376,
        version: 'v1.41'
    })
    return docker
}
