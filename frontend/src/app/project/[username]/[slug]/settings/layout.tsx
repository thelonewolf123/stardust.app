import { SettingsNavLink } from '@/components/internal/settings-navlink'

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <section className="container">
            <SettingsNavLink />
            {children}
        </section>
    )
}
