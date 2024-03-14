'use client'

import { useFormStatus } from 'react-dom'

import { rollbackToVersion } from '@/action/rollback'

import { Button } from '../../ui/button'

export function SubmitButton({ text }: { text: string }) {
    const { pending } = useFormStatus()

    return (
        <Button variant="outline" type="submit" loading={pending}>
            {text}
        </Button>
    )
}

export function RollbackForm({
    slug,
    currentSlug
}: {
    slug: string
    currentSlug: string
}) {
    return (
        <form action={rollbackToVersion}>
            <input type="hidden" name="containerSlug" value={slug} />

            <SubmitButton
                text={currentSlug === slug ? 'Re-deploy' : 'Roll back'}
            />
        </form>
    )
}