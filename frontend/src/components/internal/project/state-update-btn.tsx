'use client'

import { useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'

import { pauseProject, resumeProject } from '@/action/project'
import { Button } from '@/components/ui/button'
import { ContainerStatus } from '@/graphql-client'

export function ProjectStateUpdateBtn({
    state,
    projectSlug
}: {
    state?: ContainerStatus
    projectSlug: string
}) {
    const [loading, setLoading] = useState(false)

    async function handleStart() {
        if (state === ContainerStatus.Pending) {
            return
        }

        console.log('start')
        setLoading(true)
        await resumeProject(projectSlug)
        setLoading(false)
    }

    async function handleStop() {
        console.log('stop')
        setLoading(true)
        await pauseProject(projectSlug)
        setLoading(false)
    }

    if (state === ContainerStatus.Running) {
        return (
            <Button
                leftIcon={<FaPause />}
                variant={'destructive'}
                loading={loading}
                onClick={handleStop}
            >
                Stop
            </Button>
        )
    }

    return (
        <Button
            disabled={state === ContainerStatus.Pending}
            leftIcon={<FaPlay />}
            loading={loading}
            variant={'outline'}
            onClick={handleStart}
        >
            Start
        </Button>
    )
}
