import { ProjectArrayForm } from '@/components/internal/forms/array-form'
import { getProjectDetails } from '@/data/project'

export default async function EnvironmentPage({
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
            propertyKey="env"
            prefix="env"
            descriptionName="Environment Variables"
            redirectTo={`/new/meta-data?slug=${slugEncoded}`}
            backTo={`/new/build-args?slug=${slugEncoded}`}
            type="new"
            start={false}
        />
    )
}

export const dynamic = 'force-dynamic'
