import { ProjectArrayForm } from '@/components/internal/forms/array-form'
import { getProjectDetails } from '@/data/project'

export default async function EnvironmentPage({
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
            propertyKey="env"
            prefix="env"
            descriptionName="Environment Variables"
        />
    )
}

export const dynamic = 'force-dynamic'
