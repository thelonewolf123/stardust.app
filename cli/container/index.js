// @ts-check
import gql from 'graphql-tag'

import { getApolloClient } from '../client.js'
/**
 * @typedef {Object} NewContainerInput
 * @property {string} name
 * @property {string} description
 * @property {string} dockerContext
 * @property {string} dockerPath
 * @property {string} githubBranch
 * @property {number} port
 * @property {string} githubUrl
 */
export async function createNewContainer(
    /** @type {NewContainerInput} */ params
) {
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
