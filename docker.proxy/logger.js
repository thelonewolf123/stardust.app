// @ts-check

const dockerode = require('dockerode')
const { Redis } = require('ioredis')

const UNIX_SOCKET_PATH = '/var/run/docker.sock'

if (!process.env.REDIS_HOST) {
    console.error('REDIS_HOST is not defined')
    process.exit(1)
}

// logs from the container
const redisClient = new Redis(process.env.REDIS_HOST)
const docker = new dockerode({
    socketPath: UNIX_SOCKET_PATH
})

const containersList = []

setInterval(() => {
    docker.listContainers((err, containers) => {
        if (err) {
            console.error('Error occurred while listing containers', err)
            return
        }
        const newContainers = containersList.filter(
            (c) =>
                containers?.find((container) => container.Id === c.Id) ===
                undefined
        )

        if (newContainers.length > 0) {
            containersList.push(...newContainers)
            newContainers.forEach(async (container) => {
                const containerLogs = await docker
                    .getContainer(container.Id)
                    .logs({
                        follow: true,
                        stdout: true,
                        stderr: true
                    })

                containerLogs.on('data', (chunk) => {
                    redisClient.publish(
                        `logger:container-logs:${container.Id}`,
                        chunk.toString()
                    )
                })

                containerLogs.on('error', (err) => {
                    console.error('Error occurred while fetching logs', err)
                    containersList.splice(
                        containersList.findIndex((c) => c.Id === container.Id),
                        1
                    )
                })
            })
        }
    })
}, 10000)
