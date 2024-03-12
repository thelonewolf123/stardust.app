import { MdMoreHoriz } from 'react-icons/md'

import { StatusIcon } from '@/components/internal/status'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
    return {
        history: project.history || [],
        name: project.name
    }
}

function DeploymentMenu({ containerSlug }: { containerSlug: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <MdMoreHoriz className="hover:cursor-pointer rounded-full hover:bg-gray-100 p-1 dark:hover:bg-slate-800 w-8 h-8" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    <p className="font-semibold">Actions</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Rollback</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default async function ProjectDeploymentPage({
    params
}: {
    params: { username: string; slug: string }
}) {
    const slug = `${params.username}/${params.slug}`
    const { history, name } = await getDeploymentHistory(slug)
    return (
        <div className="container">
            <h1 className="text-3xl space-y-2 capitalize my-4">{name}</h1>
            <div>
                {history.map((deploy, idx) => (
                    <div
                        key={idx}
                        className="border flex justify-between rounded p-4"
                    >
                        <div className="flex gap-2">
                            <p className="font-semibold">
                                Version {deploy.containerSlug.split(':').at(-1)}
                            </p>
                            <p className="text-muted-foreground">
                                deployed by {params.username}
                            </p>
                        </div>

                        <StatusIcon status={deploy.status} />
                        <p>{new Date(deploy.createdAt).toLocaleString()}</p>

                        <DeploymentMenu containerSlug={deploy.containerSlug} />
                    </div>
                ))}
            </div>
        </div>
    )
}
