import ExpressWs from 'express-ws';
import invariant from 'invariant';

import { getDockerClient } from '@/core/docker';
import { ContainerStatus } from '@/types/graphql-server';
import models from '@backend/database';

export const sshHandler: ExpressWs.WebsocketRequestHandler = async (
    ws,
    req
) => {
    try {
        const id = req.params.id
        const username = req.params.username
        const containerSlug = `${username}/${id}`

        const container = await models.Container.findOne({
            containerSlug
        }).lean()

        console.log('container', container)

        invariant(container, 'Container not found')
        invariant(
            container.status === ContainerStatus.Running,
            'Container not running'
        )
        const instance = await models.Instance.findOne({
            _id: container.instanceId
        }).lean()

        console.log('instance', instance)

        invariant(instance?.ipAddress, 'Instance not found')

        const { ipAddress } = instance

        const docker = await getDockerClient(ipAddress)

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

                    ws.on('close', () => {
                        stream.end()
                    })
                })
            })
    } catch (err) {
        console.error('Error in SSH handler', err)
        ws.close()
    }
}
