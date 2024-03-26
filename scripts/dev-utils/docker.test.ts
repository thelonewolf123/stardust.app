import { getDockerClient } from '../../packages/core/docker'

async function main() {
    const docker = await getDockerClient('3.236.115.35')

    docker
        .createContainer({
            Image: '655959644936.dkr.ecr.us-east-1.amazonaws.com/thelonewolf123/golang-tools:1',
            HostConfig: {
                PortBindings: {
                    '8080/tcp': [{ HostPort: '10000-11000' }]
                }
            },
            ExposedPorts: {
                '8080/tcp': {}
            }
        })
        .then((container) => {
            container.start()
            console.log('Container started successfully')
        })

    docker.listContainers({ all: true }).then((containers) => {
        containers.map((container) => {
            docker
                .getContainer(container.Id)
                .inspect()
                .then((info) => {
                    console.log(info.NetworkSettings.Ports)
                })
        })
    })
}

main()
