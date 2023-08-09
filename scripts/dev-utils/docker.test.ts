import { getDockerClient } from '../../packages/scheduler/library/docker'

async function main() {
    console.log(process.argv[2])
    const docker = await getDockerClient(process.argv[2])
    await docker.pull('ubuntu')
    const imageList = await docker.listImages()
    console.log(imageList)
    const containers = await docker.createContainer({
        Image: 'ubuntu',
        Cmd: ['echo', 'hello world']
    })
    await containers.start()
    const info = await containers.inspect()
    console.log(info)
}

main()
