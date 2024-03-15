import ExpressWs from 'express-ws'

import models from '@backend/database'

export const sshHandler: ExpressWs.WebsocketRequestHandler = async (
    ws,
    req
) => {
    const id = req.params.id
    const username = req.params.username
    const containerSlug = `${username}/${id}`

    const container = await models.Container.findOne({
        slug: containerSlug
    }).lean()

    if (!container) {
        return ws.close()
    }

    ws.on('message', (message) => {
        console.log('received: %s', message)
        ws.send(message) // Echo the message back
    })
}
