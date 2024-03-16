import { ProjectArrayForm } from '@/components/internal/forms/array-form'
import { getProjectDetails } from '@/data/project'

export default async function BuildArgsPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | undefined }
}) {
    const slug = searchParams?.slug
    if (!slug) {
        throw new Error('Slug not found')
    }
    const [username, projectName] = slug.split('/')
    const project = await getProjectDetails(username, projectName)
    const slugEncoded = encodeURIComponent(slug)

    return (
        <ProjectArrayForm
            project={project}
            slug={slug}
            prefix="build_args"
            propertyKey="buildArgs"
            descriptionName="Build Args"
            redirectTo={`/new/environment?slug=${slugEncoded}`}
            backTo={`/new?slug=${slugEncoded}`}
            type="new"
            start={false}
        />
    )
}
