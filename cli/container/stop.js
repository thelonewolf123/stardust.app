import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'
import { getContainerStopInput } from '../prompt/index.js'

/**
 * @param {String} projectSlug
 * @returns {Promise<Boolean>}
 */
export async function stopContainer(projectSlug) {
    const client = getGqlClient()

    const { data } = await client.mutate({
        mutation: gql`
            mutation Mutation($projectSlug: String!) {
                stopContainer(projectSlug: $projectSlug)
            }
        `,
        variables: {
            projectSlug
        }
    })

    return data.stopContainer
}

export async function stopContainerHandler() {
    const { projectSlug } = await getContainerStopInput()
    console.log('Stopping container...')
    stopContainer(projectSlug)
        .then((data) => {
            console.log('Container stopped successfully'.green.bold, data)
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container stop failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container stop failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}
