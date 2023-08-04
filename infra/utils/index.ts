import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

import { env } from '../../packages/env'

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
    const keyPath = {
        ca: './certs/ca.pem',
        cert: './certs/server-cert.pem',
        key: './certs/server-key.pem'
    }
    const isKeyExist = Object.values(keyPath).every(existsSync)

    if (!isKeyExist) {
        console.log("Generating docker's key")
        const command = `
#!/bin/bash
rm -rf ./certs
./create-certs.sh -m ca -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 900
./create-certs.sh -m server -h docker.soulforge.com -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 365
./create-certs.sh -m client -h docker -pw ${env.REMOTE_DOCKER_PASSWORD} -t certs -e 365`

        console.log(
            'Please run the command to generate docker certificate',
            command
        )
        process.exit(1)
    }

    return {
        ca: readFileSync(keyPath.ca).toString(),
        cert: readFileSync(keyPath.cert).toString(),
        key: readFileSync(keyPath.key).toString()
    }
}
