'use server'

import {
    RollbackProjectDocument,
    RollbackProjectMutation
} from '@/graphql-client'
import { getApolloClient } from '@/lib/server-utils'

export const rollbackToVersion = async (formData: FormData) => {
    try {
        const containerSlug = formData.get('containerSlug') as string
        const slug = containerSlug.split(':').at(0) || ''
        const version = parseInt(containerSlug.split(':').at(-1) || '')
        const client = await getApolloClient()
        await client.mutate<RollbackProjectMutation>({
            mutation: RollbackProjectDocument,
            variables: {
                slug,
                version
            }
        })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
