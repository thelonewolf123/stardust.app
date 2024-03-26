const http = require('http')
const httpProxy = require('http-proxy')
const { Redis } = require('ioredis')

const proxy = httpProxy.createProxyServer()

const TARGET_HOST = '0.0.0.0'
const TARGET_PORT = 80

const redisClient = new Redis(process.env.REDIS_HOST)

const server = http.createServer(async (req, res) => {
    // domain lookup
    const ipPort = await redisClient.hget('domainMap', req.headers.host)
    if (!ipPort) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
        return
    }

    const [ip, port] = ipPort.split(':')
    proxy.web(req, res, { target: { host: ip, port } })
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
