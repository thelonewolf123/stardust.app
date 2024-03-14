import { ProjectNavLink } from '@/components/internal/project/project-navlink'
import { Separator } from '@/components/ui/separator'

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <ProjectNavLink />
            <Separator className="w-full" />
            {children}
        </>
    )
}
