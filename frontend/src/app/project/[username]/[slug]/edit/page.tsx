import EditProject from '@/components/internal/edit-project'
import {
    GetProjectBySlugForEditDocument,
    GetProjectBySlugForEditQuery
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

async function getProjectDetails(username: string, slug: string) {
    const client = await getApolloClient()
    const { data } = await client.query<GetProjectBySlugForEditQuery>({
        query: GetProjectBySlugForEditDocument,
        variables: { slug: `${username}/${slug}` }
    })
    const project = data.getProjectBySlug
    return {
        name: project.name,
        slug: project.slug,
        description: project.description,
        githubBranch: project.githubBranch || '',
        githubUrl: project.githubUrl || '',
        dockerPath: project.dockerPath,
        dockerContext: project.dockerContext,
        env: project.current?.env || [],
        buildArgs: project.current?.buildArgs || [],
        metaData: project.current?.metaData || []
    }
}
export default async function ProjectEditPage({
    params
}: {
    params: {
        username: string
        slug: string
    }
}) {
    const project = await getProjectDetails(params.username, params.slug)
    return <EditProject defaultValues={project} slug={project.slug} />
}
