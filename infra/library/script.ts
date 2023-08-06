import { dockerServiceConf } from '../data'
import { generateDockerKey } from '../utils'

const dockerKey = generateDockerKey()

export const ec2UserData = `
#!/bin/bash
sudo apt-get update
sudo apt-get install -y docker.io git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo mkdir -p /data/certs
sudo chmod 777 /data/certs
sudo echo '${dockerKey.ca}' > /data/certs/ca.pem
sudo echo '${dockerKey.cert}' > /data/certs/server-cert.pem
sudo echo '${dockerKey.key}' > /data/certs/server-key.pem
sudo chmod 644 /data/certs/ca.pem
sudo chmod 644 /data/certs/server-cert.pem
sudo chmod 644 /data/certs/server-key.pem
sudo systemctl stop docker
sudo chmod 777 /lib/systemd/system/docker.service
sudo echo '${dockerServiceConf}' > /lib/systemd/system/docker.service
sudo chmod 644 /lib/systemd/system/docker.service
sudo systemctl daemon-reload
sudo systemctl start docker
`
// https://www.ibm.com/docs/en/rtas/10.0.2_dev?topic=hosts-setting-up-remote-docker
// curl -k https://35.170.248.191/images/json \
//   --cert ./infra/certs/client-docker-cert.pem \
//   --key ./infra/certs/client-docker-key.pem \
//   --cacert ./infra/certs/ca-key.pem

console.log(ec2UserData)
