---
sidebar_position: 4
---

# Docker Proxy

## Overview

The Docker Proxy is a reverse proxy that routes HTTP traffic from custom domains to user containers running on EC2 instances.

## Architecture

```
Internet (custom domain)
        │
        ▼
   Cloudflare DNS
        │
        ▼
   EC2 Proxy Instance
        │
        ▼
   http-proxy (Node.js)
        │
        ├──► Container A (port 3001)
        ├──► Container B (port 3002)
        └──► Container C (port 3003)
```

## How It Works

1. Each deployed container gets a unique port on its host instance
2. The proxy reads container-to-port mappings from Redis
3. When a request arrives for a custom domain, the proxy looks up the target container's host:port
4. It proxies the HTTP request to the appropriate container

```javascript
// Simplified proxy logic
const proxy = httpProxy.createProxy();

server.on('request', (req, res) => {
  const target = getContainerForDomain(req.headers.host);
  proxy.web(req, res, { target: `http://${target.host}:${target.port}` });
});
```
