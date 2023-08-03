import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

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
