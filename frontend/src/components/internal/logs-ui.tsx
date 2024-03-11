'use client'

import 'xterm/css/xterm.css'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Container } from '@/graphql-client'

import { Button } from '../ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../ui/select'
import BuildLogsTab from './tabs/build-tab'
import ContainerLogsTab from './tabs/container-tab'

const TerminalComp = dynamic(() => import('./tabs/terminal-tab'), {
    loading: () => (
        <CardContent className="p-2 flex h-80 justify-center items-center">
            <Button className="btn btn-primary" loading={true}>
                Loading...
            </Button>
        </CardContent>
    ),
    ssr: false
})

enum TABS {
    container = 'container',
    build = 'build',
    terminal = 'terminal'
}

export default function TerminalTab({ slug }: { slug: string }) {
    const [start, setStart] = useState(false)

    if (!start) {
        return (
            <CardContent className="p-2 flex h-80 justify-center items-center">
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

    return <TerminalComp slug={slug} />
}

export const LogsUi: React.FC<{
    current?: Container | null
    history?: Pick<Container, 'containerSlug'>[] | null
}> = ({ current, history }) => {
    const [activeTab, setActiveTab] = useState<TABS>(TABS.container)
    const [selectedContainerSlug, setSelectedContainerSlug] = useState<string>(
        () => {
            if (current) {
                return current.containerSlug
            }
            return history?.at(-1)?.containerSlug || ''
        }
    )

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

            {activeTab === TABS.container && (
                <ContainerLogsTab slug={selectedContainerSlug} />
            )}
            {activeTab === TABS.build && (
                <BuildLogsTab slug={selectedContainerSlug} />
            )}
            {activeTab === TABS.terminal && (
                <TerminalTab slug={selectedContainerSlug} />
            )}
        </Card>
    )
}
