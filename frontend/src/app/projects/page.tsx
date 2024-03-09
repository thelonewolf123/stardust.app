import { cookies } from 'next/headers'

import { GetAllProjectsDocument, GetAllProjectsQuery } from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

const fetchProjects = async () => {
    const client = await getApolloClient()
    const { data } = await client.query<GetAllProjectsQuery>({
        query: GetAllProjectsDocument
    })

    return data.getAllProjects
}

export default async function ProjectPage() {
    const projects = await fetchProjects()

    return (
        <div>
            <h1>Projects</h1>
            <p>Here are all the projects</p>
            <ul>
                {projects.map((project) => (
                    <li key={project.slug}>{project.name}</li>
                ))}
            </ul>
        </div>
    )
}
