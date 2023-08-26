import { getDockerClient } from '../../packages/core/docker'

async function main() {
    console.log(process.argv[2])
    const docker = await getDockerClient(process.argv[2])
    docker.buildImage(
        '/home/ubuntu/learning-golang.zip',
        {
            t: 'docker.io/docker-golang:0',
            dockerfile: 'Dockerfile'
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
}

main()
