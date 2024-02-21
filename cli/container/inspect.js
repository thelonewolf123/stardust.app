import chalk from 'chalk'
import { getProjectBySlug } from '../project/index.js'
import { getInspectProjectInput } from '../prompt/index.js'

/**
 *
 * @param {string} slug
 */
async function inspectContainer(slug) {
    const project = await getProjectBySlug(slug)

    const headingStyle = chalk.bold.underline
    const keyStyle = chalk.yellow.bold
    const valueStyle = chalk.green

    console.log(headingStyle('Project Details:'))
    console.log(keyStyle('Name:'), valueStyle(project.name))
    console.log(keyStyle('Description:'), valueStyle(project.description))
    console.log(keyStyle('GitHub URL:'), valueStyle(project.githubUrl))
    console.log(keyStyle('Status:'), valueStyle(project.current.status))
    console.log(keyStyle('Docker Context:'), valueStyle(project.dockerContext))
    console.log(keyStyle('Docker Path:'), valueStyle(project.dockerPath))
    console.log(keyStyle('GitHub Branch:'), valueStyle(project.githubBranch))
    console.log(keyStyle('Slug:'), valueStyle(project.slug))
}

export async function inspectContainerHandler() {
    getInspectProjectInput()
        .then((input) => inspectContainer(input.projectSlug))
        .then(() => {
            process.exit(0)
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container inspection failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container inspection failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}
