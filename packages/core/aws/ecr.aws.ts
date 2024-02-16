import invariant from 'invariant'

// aws ecr manage strategy
import { env } from '@/env'
import {
    CreateRepositoryCommand,
    DeleteRepositoryCommand,
    DeleteRepositoryCommandInput,
    ECRClient,
    GetAuthorizationTokenCommand
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
    const input: DeleteRepositoryCommandInput = {
        repositoryName: params.name, // required
        force: true
    }
    const command = new DeleteRepositoryCommand(input)
    const response = await client.send(command)
    return response
}

async function getAuthorizationToken(): Promise<{
    username: string
    password: string
}> {
    const client = getClient()
    const response = await client.send(new GetAuthorizationTokenCommand({}))

    invariant(
        response.authorizationData && response.authorizationData.length > 0,
        'No authorization data found'
    )
    invariant(
        response.authorizationData[0].authorizationToken,
        `No authorization token found in response: ${JSON.stringify(
            response.authorizationData
        )}`
    )

    const authorizationData = response.authorizationData[0]

    invariant(
        authorizationData.authorizationToken,
        `No authorization token found in response: ${JSON.stringify(
            response.authorizationData
        )}`
    )

    const authToken = Buffer.from(
        authorizationData.authorizationToken,
        'base64'
    ).toString()
    const [username, password] = authToken.split(':')

    return {
        username,
        password
    }
}

export const ecr = {
    createEcrRepo,
    deleteEcrRepo,
    getAuthorizationToken
}
