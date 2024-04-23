import Image from 'next/image';
import Link from 'next/link';

import { LogsUi } from '@/components/internal/logs-ui';
import { ProjectStateUpdateBtn } from '@/components/internal/project/state-update-btn';
import { StatusIcon } from '@/components/internal/project/status';
import { Button } from '@/components/ui/button';
import { getProject } from '@/data/project';

export default async function SingleProjectPage({
    params
}: {
    params: { username: string; slug: string }
}) {
    const project = await getProject(params.username, params.slug)

    if (!project) {
        return (
            <div className="flex justify-center h-full items-center">
                <h1 className="text-4xl">Project not found</h1>
            </div>
        )
    }

    return (
        <div className="container mt-4 space-y-2">
            <div className="flex justify-between my-8">
                <h1 className="text-3xl space-y-2 capitalize mb-4">
                    {project.name}
                </h1>
                <div className="flex gap-2">
                    <Link href={project.githubUrl} target="_blank">
                        <Button variant={'outline'}>Github Repo</Button>
                    </Link>

                    <ProjectStateUpdateBtn
                        projectSlug={project.slug}
                        state={project.current?.status}
                    />

                    {project.domains ? (
                        <Link
                            href={`https://${project.domains[0]}`}
                            target="_blank"
                        >
                            <Button>View</Button>
                        </Link>
                    ) : (
                        <Button disabled>View</Button>
                    )}
                </div>
            </div>
            <div className="rounded shadow-md p-5 px-4 md:flex gap-4 w-full dark:bg-slate-900">
                <div className="md:w-1/3 prose dark:prose-invert">
                    <h3>Preview</h3>
                    <Image
                        src={'/placeholder.jpeg'}
                        alt={project.name}
                        className="w-full rounded-md bg-black transition-transform ease-in-out duration-300 transform hover:scale-105 max-h-72"
                        height={600}
                        width={400}
                    />
                </div>
                <div className="prose dark:prose-invert">
                    <h3>Description</h3>
                    <p>{project.description}</p>
                    <h4>
                        Created on {new Date(project.createdAt).toDateString()}
                    </h4>
                    <span className="flex gap-2 items-baseline">
                        <h4>Github Branch:</h4>
                        <p>{project.githubBranch}</p>
                    </span>
                    <span className="flex gap-2 items-baseline">
                        <h4>Current Container:</h4>
                        <p>{project.current?.containerSlug || 'N/A'}</p>
                    </span>
                    <span className="flex gap-2 items-baseline">
                        <h4>Current project commit:</h4>
                        <p>
                            {(project.current?.commitHash || 'N/A').slice(-7)}
                        </p>
                    </span>
                    <span className="flex gap-2 items-baseline">
                        <h4>Current commit message:</h4>
                        <p>{project.current?.commitMessage || 'N/A'}</p>
                    </span>
                    <h4 className="flex gap-2 items-baseline">
                        Current Container Status:{' '}
                        <StatusIcon status={project.current?.status} />
                    </h4>
                </div>
            </div>
            <div className="py-4">
                <h3 className="font-semibold text-2xl mb-2">Logs</h3>
                <LogsUi current={project.current} history={project.history} />
            </div>
        </div>
    )
}
