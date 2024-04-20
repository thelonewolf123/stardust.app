'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaGithub } from 'react-icons/fa'

import { Redirect } from '@/components/internal/common/redirect'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const session = useSession()

    async function handleLogin() {
        setLoading(true)
        await signIn('github')
        setLoading(false)
        router.push('/projects')
    }

    if (session.data?.user) {
        return <Redirect to="/projects" />
    }

    return (
        <div className="h-screen flex">
            <div className="md:w-1/2 h-full bg-gray-600 bg-[url(/login-bg.png)] bg-cover"></div>
            <div className="w-full md:w-1/2 h-full p-5 bg-secondary flex flex-col">
                <div className="my-5">
                    <h1>
                        <span className="text-4xl font-semibold">Stardust</span>
                        <span className="text-4xl text-red-500 font-semibold">
                            .
                        </span>
                        <span className="text-4xl font-semibold">app</span>
                    </h1>
                    <p className="text-red-500">
                        Cloud deployment platform for developers
                    </p>
                </div>
                <h1 className="text-gray-600 dark:text-gray-300">
                    <span className="text-4xl">Hello,</span>
                    <br className="my-1" />
                    <span className="text-6xl font-bold">Welcome!</span>
                </h1>
                <div className="flex justify-center items-center flex-col flex-grow">
                    <Button
                        leftIcon={<FaGithub />}
                        loading={loading}
                        size={'lg'}
                        onClick={handleLogin}
                    >
                        Login with GitHub
                    </Button>
                </div>
            </div>
        </div>
    )
}
