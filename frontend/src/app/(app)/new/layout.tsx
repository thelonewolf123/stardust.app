import { NewNavLink } from '@/components/internal/new/new-navlink'

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <section className="container">
            <h1 className="text-3xl space-y-2 capitalize my-8">New Project</h1>
            <div className="flex gap-4 w-full">
                <NewNavLink />
                <div className="w-3/4">{children}</div>
            </div>
        </section>
    )
}
