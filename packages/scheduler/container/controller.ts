import invariant from 'invariant'
import { z } from 'zod'

import ec2Aws from '@core/ec2.aws'

import { getDockerClient } from '../library/docker'
import {
    getInstanceForNewContainer,
    waitTillInstanceReady
} from '../library/instance'
import { getInstanceIdByContainerId, updateContainer } from '../lua/container'
import { ContainerDestroySchema, ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const containerSlug = data.containerSlug
    const instanceId = await getInstanceForNewContainer(containerSlug)
    const instance = await ec2Aws.getInstanceInfoById(instanceId)

    invariant(instance, 'Instance not found')
    console.log('instance', instance)

    await waitTillInstanceReady(instanceId)

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

export async function destroyContainer(
    data: z.infer<typeof ContainerDestroySchema>
) {
    console.log('destroy', data)
    const instanceId = await getInstanceIdByContainerId(data.containerId)
    invariant(instanceId, 'Instance not found')
    const instance = await ec2Aws.getInstanceInfoById(instanceId)
    invariant(instance, 'Instance not found')

    const docker = await getDockerClient(instance.PublicIpAddress!)
    const container = await docker.getContainer(data.containerId)
    await container.stop()
    await container.remove()
}
