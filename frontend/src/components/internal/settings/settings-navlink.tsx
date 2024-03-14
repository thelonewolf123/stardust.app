'use client'

import Link from 'next/link'
import {
    useParams,
    usePathname,
    useSelectedLayoutSegment,
    useSelectedLayoutSegments
} from 'next/navigation'

const SETTINGS_LINKS = [
    { label: 'General', href: '/' },
    { label: 'Environment', href: '/environment' },
    {
        label: 'Build Args',
        href: '/build-args'
    },
    {
        label: 'Meta Data',
        href: '/meta-data'
    },
    {
        label: 'Webhooks',
        href: '/webhooks'
    },
    { label: 'Billing', href: '/billing' }
]

export function SettingsNavLink() {
    const params = useParams()
    const segment = useSelectedLayoutSegment()

    const projectPath = `/project/${params.username}/${params.slug}/settings`

    return (
        <div className="font-semibold flex gap-4 flex-col pr-4">
            {SETTINGS_LINKS.map((link) => (
                <Link key={link.label} href={`${projectPath}${link.href}`}>
                    <h4
                        className={`${
                            link.href === `/${segment || ''}`
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
