'use client'

import AnsiToHtml from 'ansi-to-html'
import DomPurify from 'dompurify'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Container, useGetBuildLogsQuery } from '@/graphql-client'

enum TABS {
    container = 'container',
    build = 'build',
    terminal = 'terminal'
}

const BuildLogsTab = ({ slug }: { slug: string }) => {
    const [logs, setLogs] = useState<string[]>([])
    const { data } = useGetBuildLogsQuery({
        variables: { containerSlug: slug },
        onCompleted: (data) => {
            console.log(data)
            const ansiToHtml = new AnsiToHtml()
            const logs = data.getBuildLogs
                .map((f) => {
                    // handle caret return
                    return f.replace(/\r/g, '\n')
                })
                .map((log) => ansiToHtml.toHtml(log))
                .map((log) => DomPurify.sanitize(log))

            setLogs(logs)
        }
    })

    return (
        <CardContent className="p-2 max-h-80 overflow-y-scroll">
            {data ? (
                logs.map((log, index) => (
                    <div key={index}>
                        <pre dangerouslySetInnerHTML={{ __html: log }}></pre>
                    </div>
                ))
            ) : (
                <p>Loading...</p>
            )}
        </CardContent>
    )
}

const ContainerLogsTab = () => {
    return (
        <CardContent className="p-2">
            <p>Container logs will be displayed here</p>
        </CardContent>
    )
}

const TerminalLogsTab = () => {
    return (
        <CardContent className="p-2">
            <p>Terminal logs will be displayed here</p>
        </CardContent>
    )
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
            <div className="flex prose dark:prose-invert gap-4 p-4 pb-2">
                {Object.values(TABS).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xl capitalize ${
                            activeTab === tab
                                ? 'text-blue-500 text-xl font-semibold border-b-2 border-blue-500'
                                : ''
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <Separator className="w-full" />
            <CardContent className="p-2">
                {activeTab === TABS.container && <ContainerLogsTab />}
                {activeTab === TABS.build && (
                    <BuildLogsTab slug={selectedContainerSlug} />
                )}
                {activeTab === TABS.terminal && <TerminalLogsTab />}
            </CardContent>
        </Card>
    )
}
