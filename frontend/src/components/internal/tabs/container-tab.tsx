import AnsiToHtml from 'ansi-to-html'
import DomPurify from 'dompurify'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { CardContent } from '@/components/ui/card'
import { getBackendServerUrl } from '@/lib/graphql'

export default function ContainerLogsTab({ slug }: { slug: string }) {
    const [logs, setLogs] = useState<{ message: string; timestamp: number }[]>(
        []
    )
    const logsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Fetch container logs
        const BASE_URL = getBackendServerUrl()
        const eventSource = new EventSource(
            `${BASE_URL}/api/container/${slug}/logs`
        )
        const ansiToHtml = new AnsiToHtml()

        const logHandler = (e: MessageEvent<any>) => {
            setLogs((prevLogs) => {
                const msgObject = JSON.parse(e.data)
                const { message, timestamp } = msgObject
                const ansiToHtmlMessage = ansiToHtml.toHtml(message)
                const purifiedMessage = DomPurify.sanitize(ansiToHtmlMessage)
                const newLogs = [
                    ...prevLogs,
                    { message: purifiedMessage, timestamp }
                ]
                return newLogs
            })
        }
        eventSource.addEventListener('message', logHandler)

        return () => {
            eventSource.removeEventListener('message', logHandler)
            eventSource.close()
        }
    }, [slug])

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
