// aws ecr manage strategy
import { env } from '@/env'
import {
    CreateRepositoryCommand,
    DeleteRepositoryCommand,
    ECRClient
} from '@aws-sdk/client-ecr' // ES Modules import

// const { ECRClient, CreateRepositoryCommand } = require("@aws-sdk/client-ecr"); // CommonJS import

function getClient() {
    const client = new ECRClient({
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_ACCESS_KEY_SECRET
        }
    })

    return client
}

async function createEcrRepo(params: { name: string }) {
    const client = getClient()
    const input = {
        repositoryName: params.name // required
    }
    const command = new CreateRepositoryCommand(input)
    const response = await client.send(command)
    return response
}

async function deleteEcrRepo(params: { name: string }) {
    const client = getClient()
    const input = {
        repositoryName: params.name // required
    }
    const command = new DeleteRepositoryCommand(input)
    const response = await client.send(command)
    return response
}

export const ecr = {
    createEcrRepo,
    deleteEcrRepo
}
