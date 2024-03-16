'use client'

import Link from 'next/link'
import { useSearchParams, useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'

const NEW_PROJECT_STEPS = [
    { label: 'General', href: '/' },
    {
        label: 'Build Args',
        href: '/build-args'
    },
    { label: 'Environment', href: '/environment' },
    {
        label: 'Meta Data',
        href: '/meta-data'
    }
]

export function NewNavLink() {
    const [isProjectCreated, setIsProjectCreated] = useState(false)
    const segment = useSelectedLayoutSegment()
    const slug = useSearchParams().get('slug')

    useEffect(() => {
        if (slug) {
            setIsProjectCreated(true)
        }
    }, [slug])

    const projectPath = `/new`

    return (
        <div className="flex w-1/4 flex-col gap-4 pr-4 font-semibold">
            {NEW_PROJECT_STEPS.map((link) => {
                let href = `${projectPath}${link.href}`
                if (slug) {
                    href += `?slug=${encodeURIComponent(slug)}`
                }
                return (
                    <Link key={link.label} href={href}>
                        <h4
                            className={` rounded p-2 ${
                                link.href === `/${segment || ''}`
                                    ? 'border-1 border-primary rounded'
                                    : 'text-muted-foreground'
                            } ${
                                isProjectCreated
                                    ? 'hover:bg-muted hover:text-primary hover:cursor-pointer'
                                    : 'cursor-not-allowed'
                            }`}
                        >
                            {link.label}
                        </h4>
                    </Link>
                )
            })}
        </div>
    )
}
