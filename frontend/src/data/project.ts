import {
    GetProjectBySlugDocument,
    GetProjectBySlugForEditDocument,
    GetProjectBySlugForEditQuery,
    GetProjectBySlugQuery
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

export async function getProjectDetails(username: string, slug: string) {
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
        metaData: project.current?.metaData || [],
        port: project.current?.port || undefined
    }
}

export const getProject = async (username: string, slug: string) => {
    try {
        const client = await getApolloClient()
        const { data } = await client.query<GetProjectBySlugQuery>({
            query: GetProjectBySlugDocument,
            variables: { slug: `${username}/${slug}` }
        })

        return data.getProjectBySlug
    } catch (error) {
        console.error('Error getting project by slug', error)
    }
}
