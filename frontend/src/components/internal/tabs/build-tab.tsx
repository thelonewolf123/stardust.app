import AnsiToHtml from 'ansi-to-html'
import DomPurify from 'dompurify'
import { useState } from 'react'

import { CardContent } from '@/components/ui/card'
import { useGetBuildLogsQuery } from '@/graphql-client'

export default function BuildLogsTab({ slug }: { slug: string }) {
    const [logs, setLogs] = useState<string[]>([])
    const { loading } = useGetBuildLogsQuery({
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
        <CardContent className="p-2 h-80 overflow-y-scroll">
            {loading ? (
                <p>Loading...</p>
            ) : logs.length === 0 ? (
                <p>No logs available</p>
            ) : (
                logs.map((log, index) => (
                    <div key={index}>
                        <pre dangerouslySetInnerHTML={{ __html: log }}></pre>
                    </div>
                ))
            )}
        </CardContent>
    )
}
