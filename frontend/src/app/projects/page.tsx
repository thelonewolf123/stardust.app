import Link from 'next/link'
import { FaCheckCircle } from 'react-icons/fa'
import { IoCloseCircle } from 'react-icons/io5'
import { MdPending } from 'react-icons/md'

import { StatusIcon } from '@/components/internal/project/status'
import { Badge } from '@/components/ui/badge'
import {
    ContainerStatus,
    GetAllProjectsDocument,
    GetAllProjectsQuery
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

const fetchProjects = async () => {
    try {
        const client = await getApolloClient()
        const { data } = await client.query<GetAllProjectsQuery>({
            query: GetAllProjectsDocument
        })

        return data.getAllProjects
    } catch (error) {
        console.error('Error fetching projects', error)
    }
    return []
}

const SingleProject: React.FC<{
    project: GetAllProjectsQuery['getAllProjects'][number]
}> = ({ project }) => {
    return (
        <Link href={`/project/${project.slug}`}>
            <li className="rounded-xl p-5 shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:cursor-pointer dark:bg-slate-900">
                <div className="space-y-2 border-none shadow-none outline-none">
                    <h3 className="w-full truncate text-nowrap pb-1 text-xl">
                        {project.name}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                        {project.description}
                    </p>
                    <StatusIcon status={project.current?.status} />
                </div>
            </li>
        </Link>
    )
}

export default async function ProjectsPage() {
    const projects = await fetchProjects()

    return (
        <div className="container mt-4 space-y-2">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-xl">Here are all the projects</p>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {projects.map((project) => (
                    <SingleProject key={project.slug} project={project} />
                ))}
            </ul>
        </div>
    )
}
