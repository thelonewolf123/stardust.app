import Docker from 'dockerode'

function getDockerClient() {
    const docker = new Docker({
        socketPath: '/var/run/docker.sock'
    })
    return docker
}
