import GeneralSettings from '@/components/internal/settings/general-settings'
import { getProjectDetails } from '@/data/project'

export default async function SettingsPage({
    params
}: {
    params: {
        username: string
        slug: string
    }
}) {
    const project = await getProjectDetails(params.username, params.slug)

    return <GeneralSettings project={project} slug={project.slug} />
}
