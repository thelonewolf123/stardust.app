import { createServer } from 'http'

createServer((req, res) => {
    // subdomain-based routing

    const host = req.headers.host || ''
    const subdomain = host.split('.')[0]
    console.log(subdomain)
    // TODO: subdomain look up @thelonewolf123

    res.end('Hello, world!')
}).listen(3001)
