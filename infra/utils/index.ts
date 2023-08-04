import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

import { env } from '../../packages/env';

export function generateSshKey() {
    const isKeyExist =
        existsSync('./infra-private-key.pem') &&
        existsSync('./infra-public-key.pub')

    if (!isKeyExist) {
        execSync(`
#!/bin/bash
rm -rf ./infra-private-key.pem ./infra-public-key.pub
ssh-keygen -t rsa -b 4096 -f ./infra-private-key -N ""
mv ./infra-private-key ./infra-private-key.pem
mv ./infra-private-key.pub ./infra-public-key.pub
        `)
    }

    return {
        privateKey: readFileSync('./infra-private-key.pem').toString(),
        publicKey: readFileSync('./infra-public-key.pub').toString()
    }
}

export function generateDockerKey() {
    const isKeyExist =
        existsSync('./ca.pem') &&
        existsSync('./server-cert.pem') &&
        existsSync('./server-key.pem')

    if (!isKeyExist) {
        execSync(`#!/bin/bash
rm -rf ./utils/certs
./utils/create-certs.sh -m ca -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 900
./utils/create-certs.sh -m server -h docker.soulforge.com -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 365
./utils/create-certs.sh -m client -h docker -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 365`)
    }

    return {
        ca: readFileSync('./ca.pem').toString(),
        cert: readFileSync('./server-cert.pem').toString(),
        key: readFileSync('./server-key.pem').toString()
    }
}
