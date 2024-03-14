'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'

import ProjectForm, {
    ProjectInputSchema
} from '@/components/internal/project/project-form'
import { useRefreshProjectMutation } from '@/graphql-client'

export default function EditProject({
    defaultValues,
    slug
}: {
    slug: string
    defaultValues: z.infer<typeof ProjectInputSchema>
}) {
    const [updateProject, { loading }] = useRefreshProjectMutation()
    const router = useRouter()

    const onSubmit = (values: z.infer<typeof ProjectInputSchema>) => {
        updateProject({
            variables: {
                slug,
                input: {
                    ...values,
                    env: values.env,
                    buildArgs: values.buildArgs,
                    metaData: values.metaData
                }
            }
        }).then(() => {
            router.push(`/project/${slug}`)
        })
    }

    return (
        <ProjectForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            loading={loading}
            title="Edit Project"
        />
    )
}
