import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { BsStars } from 'react-icons/bs'

import { Button } from '../../ui/button'
import { Separator } from '../../ui/separator'
import { LogoutBtn } from './logout-btn'
import { ThemeToggle } from './theme-toggle'

export default async function Navbar() {
    const session = await getServerSession()

    return (
        <>
            <nav className="flex justify-between  p-2">
                <div className="flex gap-5 items-baseline">
                    <Link href="/">
                        <h1 className="px-2 text-2xl">
                            <span className="text-2xl">✨</span> Stardust
                        </h1>
                    </Link>
                    {session ? (
                        <div className="flex items-center gap-3">
                            <Link href="/projects" className="hover:underline">
                                Projects
                            </Link>
                            <Link href="/settings" className="hover:underline">
                                Settings
                            </Link>
                            <Link href="/new" className="hover:underline">
                                New
                            </Link>
                        </div>
                    ) : null}
                </div>
                <span className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="mx-1"></span>
                    {session ? (
                        <LogoutBtn />
                    ) : (
                        <Link href="/login">
                            <Button leftIcon={<BsStars />}>Get started</Button>
                        </Link>
                    )}
                </span>
            </nav>
            <Separator />
        </>
    )
}
