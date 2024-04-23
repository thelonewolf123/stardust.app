'use client'

import { FaPause, FaPlay } from 'react-icons/fa';

import { pauseProject, resumeProject } from '@/action/project';
import { Button } from '@/components/ui/button';
import { ContainerStatus } from '@/graphql-client';

import { SubmitButton } from '../common/submit-btn';

export function ProjectStateUpdateBtn({
    state,
    projectSlug
}: {
    state?: ContainerStatus
    projectSlug: string
}) {
    return (
        <form action={resumeProject}>
            <input type="hidden" name="projectSlug" value={projectSlug} />
            {state === ContainerStatus.Running ? (
                <SubmitButton leftIcon={<FaPause />} variant={'destructive'}>
                    Stop
                </SubmitButton>
            ) : (
                <SubmitButton
                    disabled={state === ContainerStatus.Pending}
                    leftIcon={<FaPlay />}
                    variant={'outline'}
                >
                    Start
                </SubmitButton>
            )}
        </form>
    )
}
