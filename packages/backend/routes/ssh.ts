import ExpressWs from 'express-ws'
import invariant from 'invariant'

import { getDockerClient } from '@/core/docker'
import models from '@backend/database'

export const sshHandler: ExpressWs.WebsocketRequestHandler = async (
    ws,
    req
) => {
    try {
        const id = req.params.id
        const username = req.params.username
        const containerSlug = `${username}/${id}`

        const container = await models.Container.findOne({
            slug: containerSlug
        })
            .populate('instanceId')
            .lean()

        invariant(container, 'Container not found')
        invariant(container.status === 'running', 'Container not running')
        const instance = container.instanceId as any

        invariant(instance?.publicIp, 'Instance not found')

        const { publicIp } = instance

        const docker = await getDockerClient(publicIp)

        docker
            .getContainer(container.containerId)
            .exec({
                Cmd: ['/bin/sh'],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true
            })
            .then((exec) => {
                exec.start({ hijack: true, stdin: true }, (err, stream) => {
                    if (err || !stream) {
                        console.error(err)
                        ws.close()
                        return
                    }

                    ws.on('message', (message) => {
                        stream.write(message)
                    })
                    stream.on('data', (data) => {
                        ws.send(data.toString())
                    })
                    stream.on('end', () => {
                        ws.close()
                    })
                })
            })
    } catch (err) {
        console.error(err)
        ws.close()
    }
}
