import axios from 'axios'
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
export async function getArchLinuxAmiId(region: string) {
    return axios
        .get(
            `https://5nplxwo1k1.execute-api.eu-central-1.amazonaws.com/prod/${region}`
        )
        .then((r) => Promise.resolve(r.data))
        .then((r) => {
            const amiList = r.arch_amis
            const ami = amiList.find(
                (a: {
                    ami: string
                    region: string
                    arch: string
                    type: string
                    creation_time: string
                }) => a.arch === 'x86_64'
            )

            if (!ami) {
                throw new Error('No arch linux ami found')
            }

            return ami.ami
        })
}

export const getFileContent = (path: string) => {
    return readFileSync(path).toString()
}
