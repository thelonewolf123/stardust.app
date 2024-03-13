import Dockerode from 'dockerode'

async function main() {
    const docker = new Dockerode()
    const containers = await docker.listContainers()
    containers.forEach(async (container) => {
        const containerInfo = await docker.getContainer(container.Id).inspect()
        console.log(containerInfo.HostConfig.PortBindings)
    })
}

main()
