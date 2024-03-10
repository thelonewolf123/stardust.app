import Image from 'next/image'
import Link from 'next/link'

import { StatusIcon } from '@/components/internal/status'
import {
    GetProjectBySlugDocument,
    GetProjectBySlugQuery
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

const getProject = async (username: string, slug: string) => {
    const client = await getApolloClient()
    const { data } = await client.query<GetProjectBySlugQuery>({
        query: GetProjectBySlugDocument,
        variables: { slug: `${username}/${slug}` }
    })

    return data.getProjectBySlug
}

export default async function SingleProjectPage({
    params
}: {
    params: { username: string; slug: string }
}) {
    const project = await getProject(params.username, params.slug)

    return (
        <div className="container mt-4 space-y-2">
            <h1 className="text-3xl space-y-2 capitalize underline">
                {project.name}
            </h1>
            <div className="rounded shadow-md p-5 px-4 flex gap-4 w-full dark:bg-slate-900">
                <div className="w-1/3 prose dark:prose-invert">
                    <h3>Preview</h3>
                    <Image
                        src={'/placeholder.jpeg'}
                        alt={project.name}
                        className="w-full rounded-md bg-black"
                        height={600}
                        width={400}
                    />
                </div>
                <div className="prose dark:prose-invert">
                    <h3>Description</h3>
                    <p>{project.description}</p>
                    <h4>
                        Created on {new Date(project.createdAt).toDateString()}
                    </h4>
                    <span className="flex gap-2 items-baseline">
                        <h4>Github URL:</h4>
                        <Link href={project.githubUrl} target="_blank">
                            {project.githubUrl}
                        </Link>
                    </span>
                    <span className="flex gap-2 items-baseline">
                        <h4>Github Branch:</h4>
                        <p>{project.githubBranch}</p>
                    </span>
                    <span className="flex gap-2 items-baseline">
                        <h4>Current Container:</h4>
                        <p>{project.current?.containerSlug || 'N/A'}</p>
                    </span>
                    <h4 className="flex gap-2 items-baseline">
                        Current Container Status:{' '}
                        <StatusIcon status={project.current?.status} />
                    </h4>
                </div>
            </div>
        </div>
    )
}
