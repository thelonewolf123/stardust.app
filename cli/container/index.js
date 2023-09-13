import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'
import { getNewContainerInput } from '../prompt/index.js'

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
    const client = getGqlClient()

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

    return data.createProject
}

export async function deployContainerHandler() {
    const input = await getNewContainerInput()
    console.log('Creating container...')
    createNewContainer(input)
        .then((data) => {
            console.log(
                'Container deployment scheduled successfully'.green.bold,
                data
            )
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container creation failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container creation failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}

// "name": "learning-golangx",
// "description": "learning-golang - deployment",
// "dockerContext": ".",
// "dockerPath": "./Dockerfile",
// "githubBranch": "main",
// "port": 8000,
// "githubUrl": "https://github.com/thelonewolf123/learning-golang"
