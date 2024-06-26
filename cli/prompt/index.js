// @ts-check
import inquirer from 'inquirer'
import { getGqlClient } from '../client/index.js'
import gql from 'graphql-tag'
import { getAllProjects } from '../project/index.js'

export async function getLoginInput() {
    const input = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your username'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password',
            hidden: true
        }
    ])

    return input
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

export async function getDeleteProjectInput() {
    const projectList = await getAllProjects()

    if (projectList.length === 0) {
        console.log('No projects to delete'.yellow.bold)
        process.exit(0)
    }

    const input = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectSlug',
            message: 'Select the project to delete',
            choices: projectList.map((project) => ({
                name: project.name,
                value: project.slug
            }))
        }
    ])

    return input
}

export async function getContainerStartInput() {
    const client = getGqlClient()

    const { data } = await client.query({
        query: gql`
            query GetNotRunningProjects {
                getNotRunningProjects {
                    slug
                    name
                }
            }
        `,
        variables: {}
    })

    /**
     * @type {{slug: string, name: string}[]} projectList
     */
    const projectList = data.getNotRunningProjects

    if (projectList.length === 0) {
        console.log('No projects to start'.yellow.bold)
        process.exit(0)
    }

    const input = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectSlug',
            message: 'Select the project to start',
            choices: projectList.map((project) => ({
                name: project.name,
                value: project.slug
            }))
        }
    ])

    return input
}

export async function getContainerStopInput() {
    const client = getGqlClient()

    const { data } = await client.query({
        query: gql`
            query GetRunningProjects {
                getRunningProjects {
                    slug
                    name
                }
            }
        `,
        variables: {}
    })

    console.log('Select the project to stop', data.getRunningProjects)
    /**
     * @type {{slug: string, name: string}[]} projectList
     */
    const projectList = data.getRunningProjects

    const input = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectSlug',
            message: 'Select the project to start',
            choices: projectList.map((project) => ({
                name: project.name,
                value: project.slug
            }))
        }
    ])

    return input
}

export async function getInspectProjectInput() {
    const projectList = await getAllProjects()

    if (projectList.length === 0) {
        console.log('No projects to inspect'.yellow.bold)
        process.exit(0)
    }

    const input = await inquirer.prompt([
        {
            type: 'list',
            name: 'projectSlug',
            message: 'Select the project to inspect',
            choices: projectList.map((project) => ({
                name: project.name,
                value: project.slug
            }))
        }
    ])

    return input
}

export async function getContainerLogsInput() {
    const projectList = await getAllProjects()

    if (projectList.length === 0) {
        console.log('No projects to view logs'.yellow.bold)
        process.exit(0)
    }
    return inquirer.prompt([
        {
            type: 'input',
            name: 'containerSlug',
            message: 'Enter the container slug'
        }
    ])
}
