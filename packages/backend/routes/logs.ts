import { Request, Response } from 'express'

import { LOGS_EMITTER } from '../publisher'

export const getLogHandler =
    (type: 'build' | 'container') => (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders()
        res.write('data: Connected\n\n')
        const id = req.params.id
        console.log('id', id)
        const listener = (data: { id: string; message: string }) => {
            if (data.id === id) {
                res.write(`data: ${data.message}\n\n`)
            }
        }
        LOGS_EMITTER.on(type, listener)
    }
