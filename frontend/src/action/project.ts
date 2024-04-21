'use server'

import { revalidatePath } from 'next/cache'

import {
    StartContainerDocument,
    StartContainerMutation,
    StopContainerDocument,
    StopContainerMutation
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

export async function pauseProject(projectSlug: string) {
    const client = await getApolloClient()

    const { data } = await client.mutate<StopContainerMutation>({
        mutation: StopContainerDocument,
        variables: {
            projectSlug
        }
    })

    if (data?.stopContainer) {
        revalidatePath(`/project/${projectSlug}`)
    } else {
        console.error('Failed to resume project')
    }
}

export async function resumeProject(projectSlug: string) {
    const client = await getApolloClient()

    const { data } = await client.mutate<StartContainerMutation>({
        mutation: StartContainerDocument,
        variables: {
            projectSlug
        }
    })

    if (data?.startContainer) {
        revalidatePath(`/project/${projectSlug}`)
    } else {
        console.error('Failed to resume project')
    }
}
