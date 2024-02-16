import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'
import { getContainerStartInput } from '../prompt/index.js'

/**
 * @param {String} projectSlug
 * @returns {Promise<Boolean>}
 */
export async function startContainer(projectSlug) {
    const client = getGqlClient()

    const { data } = await client.mutate({
        mutation: gql`
            mutation Mutation($projectSlug: String!) {
                startContainer(projectSlug: $projectSlug)
            }
        `,
        variables: {
            projectSlug
        }
    })

    return data.startContainer
}

export async function startContainerHandler() {
    const { projectSlug } = await getContainerStartInput()
    console.log('Starting container...')
    startContainer(projectSlug)
        .then((data) => {
            console.log('Container started successfully'.green.bold, data)
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container start failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container start failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}
