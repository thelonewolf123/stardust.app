import { getDockerClient } from '../../packages/core/docker'

async function main() {
    console.log(process.argv[2])
    const docker = await getDockerClient(process.argv[2])
    const stream = await docker.pull('docker.io/library/node:latest')
    await new Promise((resolve, reject) =>
        docker.modem.followProgress(stream, resolve, (event) =>
            console.log(event)
        )
    )
    const imageList = await docker.listImages()
    console.log(imageList)
    const containers = await docker.createContainer({
        Image: 'docker.io/library/node:latest',
        Cmd: ['echo', 'hello world']
    })
    await containers.start()
    const info = await containers.inspect()
    console.log(info)
}

main()
