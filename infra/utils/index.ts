import axios from 'axios'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { env } from 'process'

import { serverEnvSchema } from '../../packages/env'

export function generateSshKey() {
    if (env.EC2_PRIVATE_KEY && env.EC2_PUBLIC_KEY) {
        return {
            privateKey: env.EC2_PRIVATE_KEY,
            publicKey: env.EC2_PUBLIC_KEY
        }
    }

    const isKeyExist =
        existsSync('./infra-private-key.pem') &&
        existsSync('./infra-public-key.pub')

    const sshScript = `#!/bin/bash
rm -rf ./infra-private-key.pem ./infra-public-key.pub
ssh-keygen -t rsa -b 4096 -f ./infra-private-key -N ""
mv ./infra-private-key ./infra-private-key.pem
mv ./infra-private-key.pub ./infra-public-key.pub
`
    if (!isKeyExist) {
        execSync(sshScript)
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

export const getEnvMap = () => {
    const envMap: Record<string, string> = {}
    const env = process.env
    const keys = Object.keys(serverEnvSchema)

    keys.forEach((key) => {
        if (typeof env[key] === 'undefined') {
            throw new Error(`Missing env variable: ${key}`)
        }
        envMap[key] = env[key] as string
    })

    return envMap
}

export const getEnvArray = () => {
    const envMap = getEnvMap()
    const envArray = Object.entries(envMap).map(([key, value]) => ({
        name: key,
        value
    }))
    return envArray
}

export const getCommitHash = () => {
    const commitHash = execSync('git rev-parse HEAD').toString().trim()
    return commitHash
}
