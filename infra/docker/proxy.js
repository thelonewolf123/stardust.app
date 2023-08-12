const http = require('http')
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer()

const UNIX_SOCKET_PATH = '/var/run/docker.sock'
const BEARER_TOKEN = process.env.BEARER_TOKEN
const TARGET_HOST = '0.0.0.0'

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

server.listen(2376, TARGET_HOST, () => {
    console.log('Proxy server listening on port 8080')
})
