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

    const build = await docker.buildImage(
        {
            context: '/home/ubuntu/learning-golang',
            src: []
        },
        {
            t: 'golang-testxs',
            buildargs: {},
            dockerfile: '/home/ubuntu/learning-golang/Dockerfile'
        }
    )

    await new Promise((resolve, reject) =>
        docker.modem.followProgress(build, resolve, (event) =>
            console.log(event)
        )
    )
    const imageList = await docker.listImages()
    console.log(imageList)
}

main()
