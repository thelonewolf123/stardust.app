import { env } from '../../packages/env'

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt install git curl nodejs podman -y

# clone the repo
sudo git clone https://oauth:${env.GITHUB_TOKEN}@github.com/thelonewolf123/soul-forge /home/ubuntu/app
cd /home/ubuntu/app
sudo git fetch ${env.BRANCH}
sudo git checkout ${env.BRANCH}
sudo git pull

# Build the fusiongrid
sudo podman build -t docker.io/thelonewolf123/fusiongrid .
sudo rm -rf /home/ubuntu/app

# Create a systemd service for the proxy
echo '[Unit]
Description=Start fusiongrid Container
Requires=podman.socket
After=podman.socket

[Service]
Restart=always
ExecStart=/usr/bin/podman start -a fusiongrid-container
ExecStop=/usr/bin/podman stop -t 2 fusiongrid-container

[Install]
WantedBy=default.target' | sudo tee /etc/systemd/system/fusiongrid.service

# Create the proxy container without running it
sudo podman create --name fusiongrid-container -v /var/run/podman/podman.sock:/var/run/docker.sock -p 2375:2375 -e BEARER_TOKEN='${env.REMOTE_DOCKER_PASSWORD}' docker.io/thelonewolf123/fusiongrid | tee /home/ubuntu/fusiongrid-create.log 

# Enable and start the service, making the container run on boot
sudo systemctl enable fusiongrid.service
sudo systemctl start fusiongrid.service
`
