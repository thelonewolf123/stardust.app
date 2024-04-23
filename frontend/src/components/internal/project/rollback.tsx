'use client'

import { rollbackToVersion } from '@/action/rollback';

import { SubmitButton } from '../common/submit-btn';

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
