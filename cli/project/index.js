import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'

/**
 * Represents a project.
 * @typedef {Object} Project
 * @property {number} createdAt - Unix timestamp representing creation time.
 * @property {ProjectCurrent} current - Current status of the project.
 * @property {string} description - Description of the project.
 * @property {string} dockerContext - Docker context.
 * @property {string} dockerPath - Docker path.
 * @property {string} githubBranch - GitHub branch.
 * @property {string} githubUrl - GitHub URL.
 * @property {Object[]} history - History of the project.
 * @property {string} history[].containerSlug - Container slug.
 * @property {string} slug - Project slug.
 * @property {string} name - Project name.
 */

/**
 * Represents the current status of a project.
 * @typedef {Object} ProjectCurrent
 * @property {string[]} command - Commands.
 * @property {string} containerSlug - Container slug.
 * @property {string[]} env - Environment variables.
 * @property {string} image - Image URL.
 * @property {string[]} metaData - Meta data.
 * @property {number} port - Port number.
 * @property {string} status - Status of the project.
 */

/**
 * @returns {Promise<Project[]>}
 */
export async function getAllProjects() {
    const client = getGqlClient()

    const { data } = await client.query({
        query: gql`
            query GetAllProjects {
                getAllProjects {
                    createdAt
                    current {
                        command
                        containerSlug
                        env {
                            name
                            value
                        }
                        image
                        metaData {
                            name
                            value
                        }
                        port
                        status
                    }
                    description
                    dockerContext
                    dockerPath
                    githubBranch
                    githubUrl
                    history {
                        containerSlug
                    }
                    slug
                    name
                }
            }
        `,
        variables: {}
    })

    return data.getAllProjects
}

/**
 * @returns {Promise<Project[]>}
 */
export async function getAllRunningProjects() {
    const client = getGqlClient()

    const { data } = await client.query({
        query: gql`
            query GetAllRunningProjects {
                getAllRunningProjects {
                    slug
                    name
                }
            }
        `,
        variables: {}
    })

    return data.getAllRunningProjects
}
