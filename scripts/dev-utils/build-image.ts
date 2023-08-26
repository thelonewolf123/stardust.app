// ip => 54.145.172.129
import { getDockerClient } from '../../packages/core/docker'

async function main() {
    console.log(process.argv[2] || '54.198.171.249')
    const docker = await getDockerClient(process.argv[2] || '54.198.171.249')
    await docker.buildImage(
        {
            context: '/root/app',
            src: []
        },
        {
            t: 'docker.io/docker-golang:0'
        },
        (err, stream) => {
            if (err || !stream) {
                console.error(err)
                return
            }
            stream.pipe(process.stdout)
        }
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
