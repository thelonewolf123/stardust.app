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

function generateProxyScript(
    domain: string,
    redisHost: string,
    cloudflareApiToken: string,
    cloudflareZoneId: string
) {
    const tld = domain.split('.').pop()
    const domainName = domain.split('.').shift()

    return `#!/bin/bash
echo "Starting proxy container"
sudo docker run -d --restart always --name reverse-proxy-container -p 8080:80 -e REDIS_HOST='${redisHost}' docker.io/thelonewolf123/docker-proxy node /app/reverse-proxy.js 2> /home/ubuntu/reverse-proxy-create.log


sudo apt update
sudo apt install -y certbot python3-certbot-nginx nginx 

git clone https://github.com/amirhooshmand/certbot-wildcard

sudo echo '
DOMAIN="${domain}"
CONTACT="admin@${domain}"
CLOUD="cf"
API_KEY="${cloudflareApiToken}"
ZONE_ID="${cloudflareZoneId}"
' | sudo tee certbot-wildcard/.creds

chmod +x certbot-wildcard/get-cert.sh

mkdir -p certbot-wildcard/manual_hooks/${domain}
cp certbot-wildcard/.creds certbot-wildcard/manual_hooks/${domain}/cf.creds
sudo ./certbot-wildcard/get-cert.sh

echo "server {
    listen 80;
    server_name ${domain} ~^(.*)\\.${domainName}\\.${tld}$;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://\\$server_name\\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${domain} ~^(.*)\\.${domainName}\\.${tld}$;

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}" | sudo tee /etc/nginx/sites-available/${domain}

sudo ln -s /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "Nginx has been configured to forward traffic for ${domain} to port 8080."
`
}
export const ec2ProxyUserData = generateProxyScript(
    env.DOMAIN_NAME,
    env.REDIS_HOST,
    env.CLOUDFLARE_API_TOKEN,
    env.CLOUDFLARE_ZONE_ID
)
