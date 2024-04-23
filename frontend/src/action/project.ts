'use server'

import { revalidatePath } from 'next/cache';

import {
    StartContainerDocument, StartContainerMutation, StopContainerDocument, StopContainerMutation
} from '@/graphql-client';
import { getApolloClient } from '@/lib/server-utils';

export async function pauseProject(formData: FormData) {
    const client = await getApolloClient()
    const projectSlug = formData.get('projectSlug') as string

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

export async function resumeProject(formData: FormData) {
    const client = await getApolloClient()
    const projectSlug = formData.get('projectSlug') as string

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
