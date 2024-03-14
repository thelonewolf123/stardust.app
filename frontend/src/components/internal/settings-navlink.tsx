'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

const SETTINGS_LINKS = [
    { label: 'General', href: '/settings' },
    { label: 'Environment', href: '/settings/environment' },
    {
        label: 'Build Args',
        href: '/settings/build-args'
    },
    {
        label: 'Meta Data',
        href: '/settings/meta-data'
    },
    {
        label: 'Webhooks',
        href: '/settings/webhooks'
    },
    { label: 'Billing', href: '/settings/billing' }
]

export function SettingsNavLink() {
    const params = useParams()
    const path = usePathname()

    const projectPath = `/project/${params.username}/${params.slug}`

    return (
        <div className="font-semibold flex gap-4 flex-col p-4">
            {SETTINGS_LINKS.map((link) => (
                <Link key={link.label} href={`${projectPath}${link.href}`}>
                    <h4
                        className={`${
                            path === `${projectPath}${link.href}`
                                ? 'border-1 border-primary rounded'
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
