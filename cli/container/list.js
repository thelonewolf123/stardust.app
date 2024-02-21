import Table from 'cli-table3'
import { getAllProjects } from '../project/index.js'

export async function listProjectsHandler() {
    try {
        const table = new Table({
            head: ['Name', 'Description', 'Github Branch', 'Github Url', 'Port']
        })

        const projects = await getAllProjects()
        for (const project of projects) {
            table.push([
                project.name,
                project.description,
                project.githubBranch,
                project.githubUrl,
                project.current.port
            ])
        }

        console.log(table.toString())
    } catch (/** @type {any} */ err) {
        if (err.response)
            console.error(
                'Project List failed,'.red.bold,
                `${err.response.errors[0].message}`.yellow
            )
        else
            console.error(
                'Project List failed,'.red.bold,
                `${err.message}`.yellow
            )
    }
}
