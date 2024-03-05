// const fs = require('fs')
// const https = require('https')
const http = require('http')
const httpProxy = require('http-proxy')
const dockerode = require('dockerode')
const { Redis } = require('ioredis')

const proxy = httpProxy.createProxyServer()

const UNIX_SOCKET_PATH = '/var/run/docker.sock'
const BEARER_TOKEN = process.env.BEARER_TOKEN
const TARGET_HOST = '0.0.0.0'
const TARGET_PORT = 2375

// const options = {
//     key: fs.readFileSync('privatekey.pem'),
//     cert: fs.readFileSync('certificate.pem')
// }

const server = http.createServer((req, res) => {
    // Extract the Bearer token from the request headers
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'text/plain' })
        res.end('Unauthorized')
        return
    }

    const providedToken = authHeader.split(' ')[1]
    if (providedToken !== BEARER_TOKEN) {
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.end('Forbidden')
        return
    }

    // Proxy the request to the Podman Unix socket
    proxy.web(req, res, { target: { socketPath: UNIX_SOCKET_PATH } })
})

// Handle errors during proxying
proxy.on('error', (err, req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    console.log(err)
    res.end('Proxy Error')
})

server.listen(TARGET_PORT, TARGET_HOST, () => {
    console.log(`Proxy server listening on port ${TARGET_PORT}`)
})

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
            (c) => c.Id !== containers.Id
        )

        if (newContainers.length > 0) {
            containersList.push(...newContainers)
            newContainers.forEach((container) => {
                const containerLogs = docker.getContainer(container.Id).logs({
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
