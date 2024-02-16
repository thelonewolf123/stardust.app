import { gql } from 'graphql-request'
import { getGqlClient } from '../client/index.js'
import { getDeleteProjectInput } from '../prompt/index.js'

/**
 * @param {String} projectSlug
 * @returns {Promise<Boolean>}
 */
export async function deleteProject(projectSlug) {
    const client = getGqlClient()

    const { data } = await client.mutate({
        mutation: gql`
            mutation Mutation($slug: String!) {
                deleteProject(slug: $slug)
            }
        `,
        variables: {
            slug: projectSlug
        }
    })

    return data.deleteProject
}

export async function deleteProjectHandler() {
    console.log('Deleting project...')
    const { projectSlug } = await getDeleteProjectInput()
    deleteProject(projectSlug)
        .then((data) => {
            console.log('Project deleted successfully'.green.bold, data)
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
