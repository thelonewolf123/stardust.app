import Docker from 'dockerode';

import { EC2_INSTANCE_USERNAME, SSM_PARAMETER_KEYS } from '../../constants/aws-infra';
import ssmAws from '../../packages/core/aws/ssm.aws';

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

    const docker = new Docker()
    return docker
}
async function main() {
    const docker = await getDockerClient('3.91.233.230')
    const containers = await docker.listContainers()
    Promise.all(
        containers.map(async (container) => {
            docker.getContainer(container.Id).exec(
                {
                    Cmd: ['/bin/echo', 'hello'],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: true
                },
                function (err, exec) {
                    if (err || !exec) {
                        console.error(err)
                        return
                    }

                    console.log('exec')

                    exec.start({ hijack: true, stdin: true }, (err, stream) => {
                        if (err || !stream) {
                            console.error(err)
                            return
                        }
                        console.log('stream')

                        stream.on('data', (data) => {
                            console.log(data.toString())
                        })
                        stream.on('close', (code: boolean) => {
                            console.log('close', code)
                        })
                        stream.on('end', () => {
                            console.log('end')
                        })

                        stream.end()
                    })
                }
            )

            await new Promise((resolve) => setTimeout(resolve, 10_000))
        })
    )
}

main()
