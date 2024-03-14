import { ProjectArrayForm } from '@/components/internal/settings/array-forms'
import { getProjectDetails } from '@/data/project'

export default async function BuildArgsPage({
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
            prefix="build_args"
            propertyKey="buildArgs"
            descriptionName="Build Args"
        />
    )
}
