import AnsiToHtml from 'ansi-to-html'
import DomPurify from 'dompurify'
import { useLayoutEffect, useRef, useState } from 'react'
import { useEventSource } from 'react-use-websocket'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { getBackendServerUrl } from '@/lib/graphql'

function ContainerLogsComp({ slug }: { slug: string }) {
    const [logs, setLogs] = useState<{ message: string; timestamp: number }[]>(
        []
    )
    const BASE_URL = getBackendServerUrl()
    const logsRef = useRef<HTMLDivElement>(null)
    useEventSource(`${BASE_URL}/api/container/${slug}/logs`, {
        onMessage: (e) => {
            setLogs((prevLogs) => {
                const msgObject = JSON.parse(e.data)
                const { message, timestamp } = msgObject
                const ansiToHtml = new AnsiToHtml()
                const ansiToHtmlMessage = ansiToHtml.toHtml(message)
                const purifiedMessage = DomPurify.sanitize(ansiToHtmlMessage)
                const newLogs = [
                    ...prevLogs,
                    { message: purifiedMessage, timestamp }
                ]
                return newLogs
            })
        }
    })

    useLayoutEffect(() => {
        if (logsRef.current) {
            logsRef.current.scrollTop = logsRef.current.scrollHeight
        }
    }, [logsRef, logs])

    return (
        <CardContent className="p-2 h-80 overflow-y-scroll" ref={logsRef}>
            {logs.length === 0 ? (
                <p>No logs available</p>
            ) : (
                logs.map((log, index) => (
                    <div
                        key={index}
                        className="flex gap-2 space-y-2 items-baseline"
                    >
                        <p className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                        </p>
                        <pre
                            dangerouslySetInnerHTML={{ __html: log.message }}
                        ></pre>
                    </div>
                ))
            )}
        </CardContent>
    )
}

export default function BuildLogsTab({ slug }: { slug: string }) {
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
                    Start Logs
                </Button>
            </CardContent>
        )
    }

    return <ContainerLogsComp slug={slug} />
}
