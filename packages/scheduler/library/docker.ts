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
    const [ca, key, cert] = await Promise.all([
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.ca),
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.key),
        ssmAws.getSSMParameter(REMOTE_DOCKER_CRED.cert)
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
