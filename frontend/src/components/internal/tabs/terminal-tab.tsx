import { use, useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

import { CardContent } from '@/components/ui/card'
import { getBackendServerUrl } from '@/lib/graphql'

export default function TerminalTab({ slug }: { slug: string }) {
    const terminalDiv = useRef<HTMLDivElement>(null)
    const fitAddOnRef = useRef<FitAddon>()
    const xtermRef = useRef<Terminal>()
    const BASE_URL = getBackendServerUrl('ws')

    const { sendMessage } = useWebSocket(
        `${BASE_URL}/api/container/${slug}/ssh`,
        {
            onMessage: (e) => {
                if (xtermRef.current) {
                    xtermRef.current.write(e.data)
                }
            }
        }
    )

    useEffect(() => {
        if (!terminalDiv.current) return // No terminal div

        const fitAddon = new FitAddon()
        const terminal = new Terminal({
            rows: 10,
            cols: 10
        })
        terminal.loadAddon(fitAddon)
        terminal.open(terminalDiv.current)
        terminal.focus()
        fitAddon.fit()
        xtermRef.current = terminal
        fitAddOnRef.current = fitAddon

        terminal.onData((data) => {
            sendMessage(data)
        })

        return () => {
            terminal.dispose()
            fitAddon.dispose()
        }
    }, [sendMessage])

    return (
        <CardContent className="p-0">
            <div ref={terminalDiv} className="h-80 rounded"></div>
        </CardContent>
    )
}
