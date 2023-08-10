import Docker from 'dockerode'

import { SSM_PARAMETER_KEYS } from '@constants/aws-infra'
import ssmAws from '@core/ssm.aws'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const [ca, key, cert] = await Promise.all([
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.dockerCa, true),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.dockerKey, true),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.dockerCert, true)
    ])

    const docker = new Docker({
        protocol: 'https',
        headers: {
            Authorization: 'Bearer asdfg'
        },
        ca: ca,
        key: key,
        cert: cert,
        host: ipAddress,
        port: 2376,
        version: 'v1.41',
        timeout: 30_000
    })
    return docker
}
