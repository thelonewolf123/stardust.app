import { use, useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

import { CardContent } from '@/components/ui/card'

export default function TerminalTab({ slug }: { slug: string }) {
    const terminalDiv = useRef<HTMLDivElement>(null)
    const fitAddOnRef = useRef<FitAddon>()
    const xtermRef = useRef<Terminal>()

    useEffect(() => {}, [])

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
        terminal.write('Hello from xterm.js')
        xtermRef.current = terminal
        fitAddOnRef.current = fitAddon
        return () => {
            terminal.dispose()
            fitAddon.dispose()
        }
    }, [])

    return (
        <CardContent className="p-0">
            <div ref={terminalDiv} className="h-80 rounded"></div>
        </CardContent>
    )
}
