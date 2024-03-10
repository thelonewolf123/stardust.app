import Link from 'next/link'

import { getAccessToken } from '@/lib/server-utils'

import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export default async function Navbar() {
    const token = await getAccessToken()

    return (
        <nav className="flex justify-between  p-2 shadow dark:shadow-slate-100">
            <a href="/">
                <h1 className="px-2 text-2xl">
                    <span className="text-2xl">✨</span> Stardust
                </h1>
            </a>
            <span className="flex items-center gap-2">
                <ThemeToggle />

                {token ? (
                    <Link href="/api/logout">
                        <Button>Logout</Button>
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="hover:underline">
                            Login
                        </Link>
                        <Link href="/signup">
                            <Button>Sign up</Button>
                        </Link>
                    </>
                )}
            </span>
        </nav>
    )
}
