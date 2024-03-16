import { ProjectArrayForm } from '@/components/internal/forms/array-form'
import { getProjectDetails } from '@/data/project'

export default async function MetaDataPage({
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
            propertyKey="metaData"
            prefix="meta_data"
            descriptionName="Meta Data"
            redirectTo={`/project/${slugEncoded}`}
            backTo={`/new/environment?slug=${slugEncoded}`}
            type="new"
            start={true}
        />
    )
}
