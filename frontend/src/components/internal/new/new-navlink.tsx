'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

const NEW_PROJECT_STEPS = [
    { label: 'General', href: '/' },
    { label: 'Environment', href: '/environment' },
    {
        label: 'Build Args',
        href: '/build-args'
    },
    {
        label: 'Meta Data',
        href: '/meta-data'
    }
]

export function NewNavLink() {
    const segment = useSelectedLayoutSegment()

    const projectPath = `/new`

    return (
        <div className="flex w-1/4 flex-col gap-4 pr-4 font-semibold">
            {NEW_PROJECT_STEPS.map((link) => (
                <Link key={link.label} href={`${projectPath}${link.href}`}>
                    <h4
                        className={`${
                            link.href === `/${segment || ''}`
                                ? 'border-1 border-primary rounded'
                                : 'text-muted-foreground'
                        } hover:bg-muted hover:text-primary rounded p-2 hover:cursor-pointer`}
                    >
                        {link.label}
                    </h4>
                </Link>
            ))}
        </div>
    )
}
