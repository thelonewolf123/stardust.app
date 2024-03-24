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
const TLD = env.DOMAIN_NAME.split('.').pop()
const DOMAIN = env.DOMAIN_NAME.split('.').shift()

export const ec2ProxyUserData = `#!/bin/bash
echo "Starting proxy container"
sudo docker run -d --restart always --name reverse-proxy-container -p 8080:80 -e REDIS_HOST='${env.REDIS_HOST}' docker.io/thelonewolf123/docker-proxy node /app/reverse-proxy.js 2> /home/ubuntu/reverse-proxy-create.log


sudo apt update
sudo apt install -y certbot python3-certbot-nginx nginx 

sudo echo '
DOMAIN="${env.DOMAIN_NAME}"
CONTACT="admin@${env.DOMAIN_NAME}"
CLOUD="cf"
API_KEY="${env.CLOUDFLARE_API_TOKEN}"
ZONE_ID="${env.CLOUDFLARE_ZONE_ID}"
' | sudo tee .creds

git clone https://github.com/amirhooshmand/certbot-wildcard .
chmod +x get-cert.sh

mkdir -p manual_hooks/${env.DOMAIN_NAME}
cp .creds manual_hooks/${env.DOMAIN_NAME}/cf.creds
sudo ./get-cert.sh

echo "server {
    listen 80;
    server_name ${env.DOMAIN_NAME} ~^(.*)\\.${DOMAIN}\\.${TLD}$;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://\\$server_name\\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${env.DOMAIN_NAME} ~^(.*)\\.${DOMAIN}\\.${TLD}$;

    ssl_certificate /etc/letsencrypt/live/${env.DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${env.DOMAIN_NAME}/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}" | sudo tee /etc/nginx/sites-available/${env.DOMAIN_NAME}

sudo ln -s /etc/nginx/sites-available/${env.DOMAIN_NAME} /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "Nginx has been configured to forward traffic for ${env.DOMAIN_NAME} to port 8080."
`
console.log('ec2ProxyUserData: ', ec2ProxyUserData)
