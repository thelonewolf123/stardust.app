// ip => 54.145.172.129
import { getDockerClient } from '../../packages/core/docker'

async function main() {
    console.log(process.argv[2] || '54.145.172.129')
    const docker = await getDockerClient(process.argv[2] || '54.145.172.129')
    await docker.pull('docker.io/library/node:latest')
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
