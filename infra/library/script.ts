import { env } from '../../packages/env';
import { dockerServiceConf } from '../data';
import { generateDockerKey } from '../utils';

const dockerKey = generateDockerKey()

export const ec2UserData = `#!/bin/bash
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y git curl nodejs podman
sudo podman pull thelonewolf123/docker-proxy
sudo podman run -d -v /var/run/docker.sock:/var/run/docker.sock -p 2376:2376 -e BEARER_TOKEN=${env.REMOTE_DOCKER_PASSWORD} thelonewolf123/docker-proxy
`
console.log(ec2UserData)
// https://www.ibm.com/docs/en/rtas/10.0.2_dev?topic=hosts-setting-up-remote-docker
// curl -k https://3.80.153.255:2376/images/json \
//   --cert ./infra/certs/client-docker-cert.pem \
//   --key ./infra/certs/client-docker-key.pem \
//   --cacert ./infra/certs/ca-key.pem
