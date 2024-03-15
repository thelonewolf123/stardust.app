'use client'

import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { ProjectGeneralInfoForm, ProjectSchema } from '@/components/internal/forms/general-form';
import { useCreateProjectMutation } from '@/graphql-client';

const defaultFormValues = {
    name: '',
    description: '',
    githubUrl: '',
    githubBranch: 'main',
    dockerPath: 'Dockerfile',
    dockerContext: '.',
    port: undefined
}

export default function NewProjectPage() {
    const [createProject, { data, loading, error }] = useCreateProjectMutation()
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof ProjectSchema>) {
        try {
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
            router.push(`/new/environment`, {
                
            })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <ProjectGeneralInfoForm
            defaultValues={defaultFormValues}
            loading={loading}
            onSubmit={onSubmit}
            type="new"
        />
    )
}
