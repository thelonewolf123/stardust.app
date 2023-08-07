export const ec2UserData = `#!/bin/bash
sudo apt-get update
sudo apt-get install -y docker.io git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
`
// https://www.ibm.com/docs/en/rtas/10.0.2_dev?topic=hosts-setting-up-remote-docker
// curl -k https://3.83.215.203:2376/images/json \
//   --cert ./infra/certs/client-docker-cert.pem \
//   --key ./infra/certs/client-docker-key.pem \
//   --cacert ./infra/certs/ca-key.pem
