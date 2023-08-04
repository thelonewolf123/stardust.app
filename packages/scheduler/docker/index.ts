import Docker from 'dockerode'

export function getDockerClient(ipAddress: string) {
    const docker = new Docker({
        socketPath: '/var/run/docker.sock'
    })
    return docker
}
