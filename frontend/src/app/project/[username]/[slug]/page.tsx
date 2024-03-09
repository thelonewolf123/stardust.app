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
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-xl">{project.description}</p>
            <p className="text-muted-foreground mb-2">
                {project.current?.status}
            </p>
        </div>
    )
}
