import { Request, Response } from 'express'
import ExpressWs from 'express-ws'

export const sshHandler: ExpressWs.WebsocketRequestHandler = (ws, req) => {
    ws.on('message', (message) => {
        console.log('received: %s', message)
        ws.send(message) // Echo the message back
    })
}
