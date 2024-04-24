import { getDockerClient } from '../../packages/core/docker'

async function main() {
    const docker = await getDockerClient('44.204.66.30')
    docker.ping((err, data) => {
        console.log('ping', err, data)
    })
    const containers = await docker.listContainers()
    Promise.all(
        containers.map(async (container) => {
            docker.getContainer(container.Id).exec(
                {
                    Cmd: ['/bin/sh'],
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

                        stream.write('echo "hello"\n')

                        // stream.end()
                    })
                }
            )

            await new Promise((resolve) => setTimeout(resolve, 10_000))
        })
    )
}

main()
