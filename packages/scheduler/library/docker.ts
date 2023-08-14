import Docker from 'dockerode'

import { SSM_PARAMETER_KEYS } from '@constants/aws-infra'
import ssmAws from '@core/ssm.aws'

export async function getDockerClient(ipAddress: string) {
    const auth = await ssmAws.getParameter(
        SSM_PARAMETER_KEYS.dockerRemotePassword,
        true
    )

    const docker = new Docker({
        protocol: 'http',
        host: ipAddress,
        headers: {
            Authorization: `Bearer ${auth}`
        },
        port: 2375,
        version: 'v1.41',
        timeout: 30_000
    })
    return docker
}
