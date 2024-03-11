'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'

import ProjectForm, {
    ProjectInputSchema
} from '@/components/internal/project-form'
import { useCreateProjectMutation } from '@/graphql-client'

export default function NewProjectPage() {
    const [createProject, { data, loading, error }] = useCreateProjectMutation()
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof ProjectInputSchema>) {
        try {
            const result = await createProject({
                variables: {
                    input: {
                        name: values.name,
                        description: values.description,
                        githubUrl: values.githubUrl,
                        githubBranch: values.githubBranch,
                        dockerPath: values.dockerPath,
                        dockerContext: values.dockerContext,
                        buildArgs: values.buildArgs,
                        port: values.port,
                        env: values.env,
                        metaData: values.metaData
                    }
                }
            })
            const containerSlug = result.data?.createProject
            if (!containerSlug) throw new Error('Container slug not found')

            const projectSlug = containerSlug.split(':')[0]
            console.log('Project created', containerSlug)
            router.push(`/project/${projectSlug}`)
        } catch (error) {
            console.error(error)
        }
    }

    return <ProjectForm loading={loading} onSubmit={onSubmit} />
}
