import invariant from 'invariant'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import ec2Aws from '@core/ec2.aws'

import { getDockerClient } from '../library/docker'
import { getInstanceForNewContainer } from '../library/instance'
import { updateContainer } from '../lua/container'
import { ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const containerSlug = nanoid()
    const instanceId = await getInstanceForNewContainer(containerSlug)
    const instance = await ec2Aws.getInstanceInfoById(instanceId)

    invariant(instance, 'Instance not found')
    console.log('instance', instance)

    const docker = await getDockerClient(instance.PublicIpAddress!)
    const newContainer = await docker.createContainer({
        Image: data.image,
        Cmd: data.command
    })

    await newContainer.start()
    const info = await newContainer.inspect()

    await updateContainer(containerSlug, {
        containerId: info.Id,
        status: 'running'
    })

    console.log('docker', docker, info)
}
