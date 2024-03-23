import { env } from '../../packages/env'

export const ec2UserData = `#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt install git -y
sudo snap install node --classic
sudo snap install aws-cli --classic
sudo snap install docker

sleep 30 # wait for docker to start

sudo docker run -d --restart always --name docker-proxy-container -v /var/run/docker.sock:/var/run/docker.sock -p 2375:2375 -e BEARER_TOKEN='${env.REMOTE_DOCKER_PASSWORD}' -e REDIS_HOST='${env.REDIS_HOST}' docker.io/thelonewolf123/docker-proxy

# Install aws-cli
sudo mkdir -p /root/.aws
echo "[default]
aws_access_key_id=${env.AWS_ACCESS_KEY_ID}
aws_secret_access_key=${env.AWS_ACCESS_KEY_SECRET}
region=${env.AWS_REGION}"  | sudo tee /root/.aws/config
sudo chmod 600 /root/.aws/config

sudo docker login --username AWS --password $(sudo aws ecr get-login-password --region ${env.AWS_REGION}) ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com
`

export const ec2ProxyUserData = `#!/bin/bash
echo "Starting proxy container"
sudo docker run -d --restart always --name reverse-proxy-container -p 8080:80 -e REDIS_HOST='${env.REDIS_HOST}' docker.io/thelonewolf123/docker-proxy node /app/reverse-proxy.js 2> /home/ubuntu/reverse-proxy-create.log 
`
console.log(ec2UserData)
