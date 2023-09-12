import gql from 'graphql-tag'

import { getApolloClient } from './client'
import { createNewContainer, getNewContainerInput } from './container'

async function login({
    username,
    password
}: {
    username: string
    password: string
}) {
    const client = getApolloClient()

    const { data } = await client.query({
        query: gql`
            query LoginQuery($username: String!, $password: String!) {
                login(username: $username, password: $password)
            }
        `,
        variables: {
            username,
            password
        }
    })

    const token = data.login
    process.env.ACCESS_TOKEN = token
}

async function main() {
    await login({
        username: 'thelonewolf123',
        password: 'Harish@2000'
    })

    const container = await getNewContainerInput()
    console.log('container', container)

    await createNewContainer(container)
}

// "name": "learning-golangx",
// "description": "learning-golang - deployment",
// "dockerContext": ".",
// "dockerPath": "./Dockerfile",
// "githubBranch": "main",
// "port": 8000,
// "githubUrl": "https://github.com/thelonewolf123/learning-golang"

main()
