import NewProjectForm from '@/components/internal/new/general-details'
import { getProjectDetails } from '@/data/project'

export default async function NewProjectPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const slug = searchParams?.slug as string
    let project = undefined
    if (slug) {
        const [username, projectName] = slug.split('/')
        project = await getProjectDetails(username, projectName)
    }

    return <NewProjectForm project={project} slug={slug} />
}
