import { env } from '../../packages/env'

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt install git curl nodejs podman docker.io awscli -y

# clone the repo
sudo git clone https://oauth:${env.GITHUB_TOKEN}@github.com/thelonewolf123/soul-forge /home/ubuntu/app
cd /home/ubuntu/app
sudo git fetch ${env.BRANCH}
sudo git checkout ${env.BRANCH}
sudo git pull

# Build the docker proxy
sudo docker build -f infra/docker/Dockerfile.proxy -t docker.io/thelonewolf123/docker-proxy docker.proxy/
sudo rm -rf /home/ubuntu/app

# Create a systemd service for the proxy
echo '[Unit]
Description=Start Proxy Container
Requires=docker.socket
After=docker.socket

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a docker-proxy-container
ExecStop=/usr/bin/docker stop -t 2 docker-proxy-container

[Install]
WantedBy=default.target' | sudo tee /etc/systemd/system/docker-proxy.service

# Create the proxy container without running it
sudo docker create --name docker-proxy-container -v /var/run/docker.sock:/var/run/docker.sock -p 2375:2375 -e BEARER_TOKEN='${env.REMOTE_DOCKER_PASSWORD}' docker.io/thelonewolf123/docker-proxy 2> /home/ubuntu/docker-proxy-create.log 

# Enable and start the service, making the container run on boot
sudo systemctl enable docker-proxy.service
sudo systemctl start docker-proxy.service

# Install aws-cli
sudo mkdir -p /root/.aws
echo "[default]
aws_access_key_id=${env.AWS_ACCESS_KEY_ID}
aws_secret_access_key=${env.AWS_ACCESS_KEY_SECRET}
region=${env.AWS_REGION}"  | sudo tee /root/.aws/config
sudo chmod 600 /root/.aws/config

sudo docker login --username AWS --password $(sudo aws ecr get-login-password --region ${env.AWS_REGION}) ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com
sudo podman login --username AWS --password $(sudo aws ecr get-login-password --region ${env.AWS_REGION}) ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com 
`
