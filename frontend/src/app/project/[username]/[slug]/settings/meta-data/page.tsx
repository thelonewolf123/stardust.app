import { ProjectArrayForm } from '@/components/internal/forms/array-form'
import { getProjectDetails } from '@/data/project'

export default async function MetaDataPage({
    params
}: {
    params: {
        username: string
        slug: string
    }
}) {
    const project = await getProjectDetails(params.username, params.slug)
    return (
        <ProjectArrayForm
            project={project}
            slug={project.slug}
            propertyKey="metaData"
            prefix="meta_data"
            descriptionName="Meta Data"
        />
    )
}

export const dynamic = 'force-dynamic'
