import { NextFunction, Request, Response } from 'express'
import { WebsocketRequestHandler } from 'express-ws'
import { generate } from 'random-words'

import models from '@backend/database'

const verifyProjectOwnership = async (req: Request) => {
    if (!req.user) {
        return false
    }

    const id = req.params.id.split(':')[0]
    const username = req.params.username
    const slug = `${username}/${id}`

    if (req.user.username !== username) {
        return false
    }

    const project = await models.Project.findOne({
        slug,
        user: req.user._id
    })

    if (!project) {
        return false
    }

    return true
}

export async function projectVerificationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const verified = await verifyProjectOwnership(req)

    if (!verified) {
        return res.status(401).send('Unauthorized')
    }

    next()
}

export const projectVerificationMiddlewareWs: WebsocketRequestHandler = async (
    ws,
    req,
    next
) => {
    const verified = await verifyProjectOwnership(req)

    if (!verified) {
        return ws.close()
    }

    next()
}

export function generateSubdomain() {
    return generate({ exactly: 2, join: '-' })
}

export function preQuery(next: Function) {
    // @ts-ignore
    if (!this.getQuery().hasOwnProperty('deleted')) {
        // @ts-ignore
        this.where('deleted').equals(false)
    }
    next()
}
