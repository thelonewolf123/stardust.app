'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

export function ProjectNavLink() {
    const params = useParams()
    const path = usePathname()

    const projectPath = `/project/${params.username}/${params.slug}`
    const deploymentPath = `${projectPath}/deployment`

    return (
        <div className="font-semibold flex gap-4 items-center p-4">
            <Link href={projectPath}>
                <h4
                    className={`${
                        path === projectPath
                            ? 'border-b-2 border-primary'
                            : 'text-muted-foreground'
                    }`}
                >
                    Project
                </h4>
            </Link>
            <Link href={deploymentPath}>
                <h4
                    className={`${
                        path === deploymentPath
                            ? 'border-b-2 border-primary'
                            : 'text-muted-foreground'
                    }`}
                >
                    Deployments
                </h4>
            </Link>
        </div>
    )
}
