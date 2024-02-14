import { gql } from 'graphql-request'
import { getGqlClient } from '../client/index.js'
import { getDeleteContainerInput } from '../prompt/index.js'

/**
 * @param {String} containerId
 * @returns {Promise<Boolean>}
 */
export async function deleteContainer(containerId) {
    const client = getGqlClient()

    const { data } = await client.mutate({
        mutation: gql`
            mutation Mutation($containerId: String!) {
                deleteProject(containerId: $containerId)
            }
        `,
        variables: {
            containerId
        }
    })

    return data.deleteProject
}

export async function deleteContainerHandler() {
    console.log('Deleting container...')
    const { containerId } = await getDeleteContainerInput()
    deleteContainer(containerId)
        .then((data) => {
            console.log('Container deleted successfully'.green.bold, data)
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container deletion failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container deletion failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}
