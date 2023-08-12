import { env } from '../../packages/env'
import { getFileContent } from '../utils'

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt install git curl nodejs podman -y
mkdir -p /home/ubuntu/docker-proxy
cd /home/ubuntu/docker-proxy
echo '${getFileContent('./docker/Dockerfile')}' > Dockerfile
echo '${getFileContent('./docker/package.json')}' > package.json
echo "${getFileContent('./docker/proxy.js')}" > proxy.js
sudo podman build -t docker.io/thelonewolf123/docker-proxy .
sudo podman run -d -v /var/run/podman/podman.sock:/var/run/docker.sock -p 2376:2376 -e BEARER_TOKEN=${
    env.REMOTE_DOCKER_PASSWORD
} docker.io/thelonewolf123/docker-proxy
`
