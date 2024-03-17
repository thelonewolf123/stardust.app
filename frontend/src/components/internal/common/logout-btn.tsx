'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { logoutAction } from '@/action/auth'

import { Button } from '../../ui/button'

export function LogoutBtn() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    return (
        <Button
            loading={loading}
            onClick={async () => {
                setLoading(true)
                await logoutAction()
                router.push('/login')
                setLoading(false)
            }}
        >
            Logout
        </Button>
    )
}
