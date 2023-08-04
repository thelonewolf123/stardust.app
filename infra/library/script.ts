import { generateDockerKey } from '../utils'

const dockerJson = {
    hosts: ['unix:///var/run/docker.sock', 'tcp://0.0.0.0:2376'],
    tls: true,
    tlscacert: '/data/certs/ca.pem',
    tlscert: '/data/certs/server-cert.pem',
    tlskey: '/data/certs/server-key.pem',
    tlsverify: true
}

const dockerKey = generateDockerKey()

export const ec2UserData = `#!/bin/bash
    sudo apt-get update
    sudo apt-get install -y docker.io git curl
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo usermod -aG docker ubuntu
    sudo mkdir -p /etc/docker/
    sudo touch /etc/docker/daemon.json
    sudo chmod 777 /etc/docker/daemon.json
    sudo echo '${JSON.stringify(dockerJson, null, 4)}' > /etc/docker/daemon.json
    sudo chmod 644 /etc/docker/daemon.json
    sudo mkdir -p /data/certs
    sudo chmod 777 /data/certs
    sudo echo '${dockerKey.ca}' > /data/certs/ca.pem
    sudo echo '${dockerKey.cert}' > /data/certs/server-cert.pem
    sudo echo '${dockerKey.key}' > /data/certs/server-key.pem
    sudo chmod 644 /data/certs/ca.pem
    sudo chmod 644 /data/certs/server-cert.pem
    sudo chmod 644 /data/certs/server-key.pem
    sudo systemctl restart docker
`
