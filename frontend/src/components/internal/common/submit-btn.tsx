'use client'

import { useFormStatus } from 'react-dom';

import { Button, ButtonProps } from '@/components/ui/button';

export function SubmitButton({ children, ...props }: ButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" {...props} loading={pending}>
            {children}
        </Button>
    )
}
