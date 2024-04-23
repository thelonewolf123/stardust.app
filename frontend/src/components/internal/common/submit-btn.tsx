'use client'

import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

export function SubmitButton({ text }: { text: string }) {
    const { pending } = useFormStatus()

    return (
        <Button variant="outline" type="submit" loading={pending}>
            {text}
        </Button>
    )
}
