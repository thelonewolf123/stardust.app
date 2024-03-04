import { getDockerClient } from '../../packages/core/docker'

const ip = '100.26.108.229'

async function main() {
    console.log(ip)
    const docker = await getDockerClient(ip)
    // const build = await docker.createImage({
    //     fromImage: 'docker.io/library/node:latest',
    //     repository: 'node',
    //     tag: 'latest',
    //     stream: true
    // })

    const build = await docker.createImage({
        remote: 'https://github.com/thelonewolf123/learning-golang/blob/main/Dockerfile',
        host: 'https://github.com'
    })

    await new Promise((resolve, reject) =>
        docker.modem.followProgress(build, resolve, (event) =>
            console.log(event)
        )
    )
    const imageList = await docker.listImages()
    console.log(imageList)
}

main()
