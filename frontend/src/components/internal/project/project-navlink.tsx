'use client'

import Link from 'next/link'
import { useParams, useSelectedLayoutSegment } from 'next/navigation'

const PROJECT_LINKS = [
    { label: 'Project', href: '/' },
    { label: 'Deployments', href: '/deployment' },
    {
        label: 'Settings',
        href: '/settings'
    }
]

export function ProjectNavLink() {
    const params = useParams()
    const segment = useSelectedLayoutSegment()

    const projectPath = `/project/${params.username}/${params.slug}`

    return (
        <div className="flex items-center gap-4 p-4 font-semibold">
            {PROJECT_LINKS.map((link) => (
                <Link key={link.label} href={`${projectPath}${link.href}`}>
                    <h4
                        className={`${
                            link.href === `/${segment || ''}`
                                ? 'border-primary border-b-2'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {link.label}
                    </h4>
                </Link>
            ))}
        </div>
    )
}
