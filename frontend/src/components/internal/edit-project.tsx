'use client'

import { z } from 'zod'

import ProjectForm, {
    ProjectInputSchema
} from '@/components/internal/project-form'

export default function EditProject({
    defaultValues
}: {
    defaultValues: z.infer<typeof ProjectInputSchema>
}) {
    const onSubmit = (values: z.infer<typeof ProjectInputSchema>) => {
        console.log(values)
    }

    return (
        <ProjectForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            loading={false}
        />
    )
}
