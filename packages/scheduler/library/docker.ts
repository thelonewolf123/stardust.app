import Docker from 'dockerode'

import { SSM_PARAMETER_KEYS } from '@constants/aws-infra'
import ssmAws from '@core/ssm.aws'

// NOTE: This is a workaround for the following error:
// Error: self signed certificate in certificate chain
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

export async function getDockerClient(ipAddress: string) {
    const auth = await ssmAws.getParameter(
        SSM_PARAMETER_KEYS.dockerRemotePassword
    )

    const docker = new Docker({
        protocol: 'http',
        host: ipAddress,
        headers: {
            Authorization: `Bearer ${auth}`
        },
        port: 2376,
        version: 'v1.41',
        timeout: 30_000
    })
    return docker
}
