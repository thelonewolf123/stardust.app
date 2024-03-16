'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import {
    ProjectGeneralInfoForm,
    ProjectSchema
} from '@/components/internal/forms/general-form'
import {
    useCreateProjectMutation,
    useGetProjectBySlugForEditQuery,
    useGetProjectBySlugQuery,
    useRefreshProjectMutation
} from '@/graphql-client'

const defaultFormValues = {
    name: '',
    description: '',
    githubUrl: '',
    githubBranch: 'main',
    dockerPath: 'Dockerfile',
    dockerContext: '.',
    port: undefined
}

export default function NewProjectForm({
    slug,
    project
}: {
    slug: string
    project?: z.infer<typeof ProjectSchema>
}) {
    const [createProject, { loading }] = useCreateProjectMutation()
    const [saveGeneralSettings, { loading: refreshLoading }] =
        useRefreshProjectMutation()
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof ProjectSchema>) {
        try {
            if (slug) {
                await saveGeneralSettings({
                    variables: {
                        slug,
                        type: 'new',
                        start: false,
                        input: {
                            ...values
                        }
                    }
                })
                router.push(`/new/build-args?slug=${slug}`)
                return
            }
            const result = await createProject({
                variables: {
                    start: false,
                    input: {
                        name: values.name,
                        description: values.description,
                        githubUrl: values.githubUrl,
                        githubBranch: values.githubBranch,
                        dockerPath: values.dockerPath,
                        dockerContext: values.dockerContext,
                        port: values.port
                    }
                }
            })
            const containerSlug = result.data?.createProject
            if (!containerSlug) throw new Error('Container slug not found')

            const projectSlug = containerSlug.split(':')[0]
            console.log('Project created', containerSlug)
            router.push(`/new/build-args?slug=${projectSlug}`)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <ProjectGeneralInfoForm
            defaultValues={project || defaultFormValues}
            loading={loading || refreshLoading}
            onSubmit={onSubmit}
            type="new"
        />
    )
}
