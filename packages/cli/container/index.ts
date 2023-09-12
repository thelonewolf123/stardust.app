import gql from 'graphql-tag'

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
