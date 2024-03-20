'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { useToast } from '@/components/ui/use-toast'
import { useRefreshProjectMutation } from '@/graphql-client'

import { ProjectGeneralInfoForm, ProjectSchema } from '../forms/general-form'

export function GeneralSettings({
    project,
    slug
}: {
    project: z.infer<typeof ProjectSchema>
    slug: string
}) {
    const [saveGeneralSettings, { loading }] = useRefreshProjectMutation()
    const { toast } = useToast()
    const router = useRouter()

    function onSubmit(values: z.infer<typeof ProjectSchema>) {
        saveGeneralSettings({
            variables: {
                slug,
                type: 'edit',
                start: true,
                input: {
                    ...values
                }
            }
        }).then(() => {
            router.refresh()
            toast({
                title: 'Project updated',
                description: 'Your project has been updated.'
            })
        })
    }

    return (
        <ProjectGeneralInfoForm
            defaultValues={project}
            onSubmit={onSubmit}
            loading={loading}
            type="edit"
        />
    )
}
