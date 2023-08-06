import updateContainer from 'inline:../lua/container/update.lua'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import { getDockerClient } from '../docker'
import ec2Aws from '../library/ec2.aws'
import { getInstanceForNewContainer } from '../library/instance'
import { runLuaScript } from '../library/redis'
import { ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const containerSlug = nanoid()
    const instanceId = await getInstanceForNewContainer(containerSlug)
    const instance = await ec2Aws.getInstanceInfoById(instanceId)

    if (!instance) throw new Error('Instance not found')
    console.log('instance', instance)

    const docker = await getDockerClient(instance.PublicIpAddress!)
    const container = await docker.createContainer({
        Image: data.image,
        Cmd: data.command
    })
    await container.start()

    const info = await container.inspect()

    await runLuaScript(updateContainer, [
        containerSlug,
        JSON.stringify({
            containerId: info.Id,
            status: 'running'
        })
    ])

    console.log('docker', docker, info)
}
