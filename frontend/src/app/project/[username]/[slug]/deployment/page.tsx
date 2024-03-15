import { CurrentBadge } from '@/components/internal/project/current'
import { RollbackForm } from '@/components/internal/project/rollback'
import { StatusIcon } from '@/components/internal/project/status'
import {
    GetDeploymentHistoryDocument,
    GetDeploymentHistoryQuery
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

const getDeploymentHistory = async (slug: string) => {
    const client = await getApolloClient()
    const { data } = await client.query<GetDeploymentHistoryQuery>({
        query: GetDeploymentHistoryDocument,
        variables: { slug }
    })
    const project = data.getProjectBySlug
    const history = project.history?.toReversed() || []

    return {
        history,
        name: project.name,
        currentSlug: project.current?.containerSlug || ''
    }
}

export default async function ProjectDeploymentPage({
    params
}: {
    params: { username: string; slug: string }
}) {
    const slug = `${params.username}/${params.slug}`
    const { history, currentSlug, name } = await getDeploymentHistory(slug)

    return (
        <div className="container">
            <h1 className="my-8 space-y-2 text-3xl capitalize">{name}</h1>
            <div className="mb-8 flex flex-col gap-4">
                {history.map((deploy, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between rounded border p-4"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <p className="font-semibold">
                                    Version{' '}
                                    {deploy.containerSlug.split(':').at(-1)}
                                </p>
                                <p className="text-muted-foreground">
                                    deployed by {params.username}
                                </p>
                            </div>
                            {deploy.containerSlug === currentSlug ? (
                                <CurrentBadge />
                            ) : null}
                        </div>

                        <StatusIcon status={deploy.status} />
                        <p>{new Date(deploy.createdAt).toLocaleString()}</p>
                        <RollbackForm
                            slug={deploy.containerSlug}
                            currentSlug={currentSlug}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
