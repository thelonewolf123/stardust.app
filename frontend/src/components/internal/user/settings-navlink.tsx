'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

const SETTINGS_LINKS = [
    { label: 'General', href: '/' },
    { label: 'Billing', href: '/billing' }
]

export function UserSettingsNavLink() {
    const segment = useSelectedLayoutSegment()
    const projectPath = `/settings`

    return (
        <div className="flex w-1/4 flex-col gap-4 pr-4 font-semibold">
            {SETTINGS_LINKS.map((link) => (
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
