'use client'

import 'xterm/css/xterm.css'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Container,
    ContainerStatus,
    GetProjectBySlugForEditQuery
} from '@/graphql-client'

import { Button } from '../ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../ui/select'
import BuildLogsTab from './tabs/build-tab'
import LiveLogsTab from './tabs/container-tab'
import LoaderUi from './tabs/loader-ui'

const TerminalComp = dynamic(() => import('./tabs/terminal-tab'), {
    loading: () => <LoaderUi />,
    ssr: false
})

enum TABS {
    container = 'container',
    build = 'build',
    terminal = 'terminal'
}

export default function TerminalTab({
    slug,
    show
}: {
    slug: string
    show: boolean
}) {
    const [start, setStart] = useState(false)

    if (!start) {
        return (
            <CardContent
                className={`p-2 h-80 flex justify-center items-center ${
                    show ? '' : 'hidden'
                }`}
            >
                <Button
                    className="btn btn-primary"
                    onClick={() => {
                        setStart(true)
                    }}
                >
                    Start terminal
                </Button>
            </CardContent>
        )
    }

    return <TerminalComp slug={slug} show={show} />
}

export const LogsUi: React.FC<{
    current?: GetProjectBySlugForEditQuery['getProjectBySlug']['current'] | null
    history?: Pick<Container, 'containerSlug' | 'status'>[] | null
}> = ({ current, history }) => {
    const tabQuery = useSearchParams().get('tab') as TABS | null
    const [activeTab, setActiveTab] = useState<TABS>(tabQuery || TABS.container)
    const [selectedContainerSlug, setSelectedContainerSlug] = useState<string>(
        () => {
            if (current) {
                return current.containerSlug
            }
            return history?.at(-1)?.containerSlug || ''
        }
    )
    const status = useMemo(() => {
        return (
            history?.find((c) => c.containerSlug === selectedContainerSlug)
                ?.status || ContainerStatus.Pending
        )
    }, [history, selectedContainerSlug])

    return (
        <Card className="h-full">
            <div className="flex items-baseline justify-between p-4">
                <div className="flex prose dark:prose-invert gap-4 pb-2">
                    {Object.values(TABS).map((tab) => (
                        <h4
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xl capitalize hover:cursor-pointer ${
                                activeTab === tab
                                    ? 'text-blue-500 font-semibold border-b-2 border-blue-500'
                                    : ''
                            }`}
                        >
                            {tab}
                        </h4>
                    ))}
                </div>
                <Select defaultValue={selectedContainerSlug}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Version" />
                    </SelectTrigger>
                    <SelectContent>
                        {history?.map((c) => (
                            <SelectItem
                                key={c.containerSlug}
                                onClick={() =>
                                    setSelectedContainerSlug(c.containerSlug)
                                }
                                value={c.containerSlug}
                            >
                                Version {c.containerSlug.split(':').at(-1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator className="w-full" />
            <LiveLogsTab
                slug={selectedContainerSlug}
                show={activeTab === TABS.container}
                type="container"
            />
            {status === ContainerStatus.Pending ? (
                <LiveLogsTab
                    slug={selectedContainerSlug}
                    show={activeTab === TABS.build}
                    auto={true}
                    type="build"
                />
            ) : (
                <BuildLogsTab
                    slug={selectedContainerSlug}
                    show={activeTab === TABS.build}
                />
            )}

            <TerminalTab
                slug={selectedContainerSlug}
                show={activeTab === TABS.terminal}
            />
        </Card>
    )
}
