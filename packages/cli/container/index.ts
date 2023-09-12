import gql from 'graphql-tag'
import inquirer from 'inquirer'

import { getApolloClient } from '../client'

type NewContainerInput = {
    name: string
    description: string
    dockerContext: string
    dockerPath: string
    githubBranch: string
    port: number
    githubUrl: string
}

export async function createNewContainer(params: NewContainerInput) {
    const client = getApolloClient()

    const { data } = await client.mutate({
        mutation: gql`
            mutation Mutation($input: ProjectInput!) {
                createProject(input: $input)
            }
        `,
        variables: {
            input: params
        }
    })
}

export async function getNewContainerInput() {
    const input = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the container'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Enter the description of the container'
        },
        {
            type: 'input',
            name: 'dockerContext',
            message: 'Enter the docker context',
            default: '.'
        },
        {
            type: 'input',
            name: 'dockerPath',
            message: 'Enter the docker path',
            default: './Dockerfile'
        },
        {
            type: 'input',
            name: 'githubBranch',
            message: 'Enter the github branch',
            default: 'main'
        },
        {
            type: 'input',
            name: 'port',
            message: 'Enter the port',
            default: 8000
        },
        {
            type: 'input',
            name: 'githubUrl',
            message: 'Enter the github url'
        }
    ])

    return input
}
