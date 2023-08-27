import { env } from '../../packages/env';

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt install git curl nodejs podman -y

# clone the repo
sudo git clone https://oauth:${env.GITHUB_TOKEN}@github.com/thelonewolf123/soul-forge /home/ubuntu/app
cd /home/ubuntu/app
sudo git fetch ${env.BRANCH}
sudo git checkout ${env.BRANCH}
sudo git pull
cd infra/docker

# Build the docker proxy
sudo podman build -t docker.io/thelonewolf123/docker-proxy .
sudo rm -rf /home/ubuntu/app

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
sudo podman create --name docker-proxy-container -v /var/run/podman/podman.sock:/var/run/docker.sock -p 2375:2375 -e BEARER_TOKEN='${env.REMOTE_DOCKER_PASSWORD}' docker.io/thelonewolf123/docker-proxy 2> /home/ubuntu/docker-proxy-create.log 

# Enable and start the service, making the container run on boot
sudo systemctl enable docker-proxy.service
sudo systemctl start docker-proxy.service

sudo mkdir -p /root/.aws
sudo echo "[default]
aws_access_key_id=${env.AWS_ACCESS_KEY_ID}
aws_secret_access_key=${env.AWS_ACCESS_KEY_SECRET}
region=${env.AWS_REGION}" > /root/.aws/config
sudo chmod 600 /home/ubuntu/.aws/config
sudo snap install aws-cli --classic
sudo aws ecr get-login-password --region region | podman login --username AWS --password-stdin ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com 
`
