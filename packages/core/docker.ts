import Docker from 'dockerode'

import { EC2_INSTANCE_USERNAME, SSM_PARAMETER_KEYS } from '@constants/aws-infra'
import ssmAws from '@core/aws/ssm.aws'

export async function getDockerClient(ipAddress: string) {
    const privateKey = await ssmAws.getParameter(
        SSM_PARAMETER_KEYS.ec2PrivateKey,
        true
    )

    const config = {
        protocol: 'ssh',
        host: ipAddress,
        username: EC2_INSTANCE_USERNAME,
        sshOptions: {
            privateKey
        }
    } as any

    const docker = new Docker(config)
    return docker
}
