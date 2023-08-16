import { env } from '../../packages/env'
import { getFileContent } from '../utils'

const dockerfile = getFileContent('./docker/Dockerfile')
const packageJson = getFileContent('./docker/package.json')
const proxyJs = getFileContent('./docker/proxy.js')

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt install git curl nodejs podman -y
mkdir -p /home/ubuntu/docker-proxy
cd /home/ubuntu/docker-proxy

# Populate the Dockerfile, package.json and proxy.js
echo '${dockerfile}' > Dockerfile
echo '${packageJson}' > package.json
echo "${proxyJs}" > proxy.js

# Build the docker proxy
sudo podman build -t docker.io/thelonewolf123/docker-proxy .

# Create a systemd service for the proxy
echo '[Unit]
Description=Start Proxy Container
Requires=podman.socket
After=podman.socket

[Service]
Restart=always
ExecStart=/usr/bin/podman start -a docker-proxy-container
ExecStop=/usr/bin/podman stop -t 2 docker-proxy-container

[Install]
WantedBy=default.target' | sudo tee /etc/systemd/system/docker-proxy.service

# Create the proxy container without running it
sudo podman create --name docker-proxy-container -v /var/run/podman/podman.sock:/var/run/docker.sock -p 2375:2375 -e BEARER_TOKEN='${env.REMOTE_DOCKER_PASSWORD}' docker.io/thelonewolf123/docker-proxy 2> /home/ubuntu/docker-proxy/create.log 

# Enable and start the service, making the container run on boot
sudo systemctl enable docker-proxy.service
sudo systemctl start docker-proxy.service
`