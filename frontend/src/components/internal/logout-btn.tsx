'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '../ui/button';

export function LogoutBtn() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    return (
        <Button
            loading={loading}
            onClick={async () => {
                setLoading(true)
                const res = await fetch('/api/logout', {
                    method: 'GET'
                })
                setLoading(false)
                if (res.status === 201) {
                    router.push('/login')
                }
            }}
        >
            Logout
        </Button>
    )
}
