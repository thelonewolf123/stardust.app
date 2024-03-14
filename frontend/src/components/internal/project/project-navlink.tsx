'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

const PROJECT_LINKS = [
    { label: 'Project', href: '' },
    { label: 'Deployments', href: '/deployment' },
    {
        label: 'Settings',
        href: '/settings'
    }
]

export function ProjectNavLink() {
    const params = useParams()
    const path = usePathname()

    const projectPath = `/project/${params.username}/${params.slug}`

    return (
        <div className="font-semibold flex gap-4 items-center p-4">
            {PROJECT_LINKS.map((link) => (
                <Link key={link.label} href={`${projectPath}${link.href}`}>
                    <h4
                        className={`${
                            path === `${projectPath}${link.href}`
                                ? 'border-b-2 border-primary'
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
