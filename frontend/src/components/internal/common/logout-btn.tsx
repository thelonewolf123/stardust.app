'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { logoutAction } from '@/action/auth'
import { Button } from '@/components/ui/button'

export function LogoutBtn() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    return (
        <Button
            loading={loading}
            onClick={async () => {
                setLoading(true)
                localStorage.removeItem('token')
                await signOut()
                await logoutAction()
                setLoading(false)
            }}
        >
            Logout
        </Button>
    )
}
