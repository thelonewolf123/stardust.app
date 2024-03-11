import { Request, Response } from 'express'

import { LOGS_EMITTER } from '../publisher'

export const getLogHandler =
    (type: 'build' | 'container') => (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders()
        const id = req.params.id
        const username = req.params.username
        const slug = `${username}/${id}`
        console.log('slug', slug)

        const listener = (data: { id: string; message: string }) => {
            if (data.id === slug) {
                res.write(`data: ${data.message}\n\n`)
            }
        }
        LOGS_EMITTER.on(type, listener)

        res.on('close', () => {
            LOGS_EMITTER.off(type, listener)
        })
    }
