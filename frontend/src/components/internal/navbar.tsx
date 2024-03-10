import Link from 'next/link'

import { getAccessToken } from '@/lib/server-utils'

import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export default async function Navbar() {
    const token = await getAccessToken()

    return (
        <nav className="flex justify-between  p-2 shadow dark:shadow-slate-100">
            <div className="flex gap-5 items-baseline">
                <Link href="/">
                    <h1 className="px-2 text-2xl">
                        <span className="text-2xl">✨</span> Stardust
                    </h1>
                </Link>
                {token ? (
                    <div className="flex items-center gap-3">
                        <Link href="/projects" className="hover:underline">
                            Projects
                        </Link>
                        <Link href="/new" className="hover:underline">
                            New
                        </Link>
                    </div>
                ) : null}
            </div>
            <span className="flex items-center gap-2">
                <ThemeToggle />

                {token ? (
                    <Link href="/api/logout">
                        <Button>Logout</Button>
                    </Link>
                ) : (
                    <div className="flex items-center gap-1">
                        <Link href="/login" className="hover:underline">
                            Login
                        </Link>
                        <Link href="/signup">
                            <Button>Sign up</Button>
                        </Link>
                    </div>
                )}
            </span>
        </nav>
    )
}
