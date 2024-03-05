import { createServer } from 'http'
import { createProxyServer } from 'http-proxy'

const proxy = createProxyServer()

createServer((req, res) => {
    // subdomain-based routing

    const host = req.headers.host || ''
    const subdomain = host.split('.')[0]

    // TODO: subdomain look up @thelonewolf123

    proxy.web(req, res, { target: 'http://localhost:3000' })
}).listen(3001)
