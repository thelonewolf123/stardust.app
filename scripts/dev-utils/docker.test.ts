import { getDockerClient } from '../../packages/scheduler/library/docker'

async function main() {
    const docker = await getDockerClient('3.92.134.75')
    await docker.pull('ubuntu')
    const containers = await docker.createContainer({
        Image: 'ubuntu',
        Cmd: ['echo', 'hello world']
    })
    await containers.start()
    const info = await containers.inspect()
    console.log(info)
}

main()
