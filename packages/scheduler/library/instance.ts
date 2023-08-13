import invariant from 'invariant'

import ec2Aws from '@core/ec2.aws'

import { scheduleContainer } from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'

export async function getInstanceForNewContainer(containerSlug: string) {
    let instanceId: null | string
    while (true) {
        instanceId = await scheduleContainer(containerSlug)
        console.log('instance Id', instanceId)
        if (instanceId) {
            break
        }
        instanceId = await scheduleNewInstance(1)
    }

    return instanceId
}

export async function scheduleNewInstance(count: number) {
    const instanceList = await ec2Aws.requestEc2OnDemandInstance(count)
    invariant(instanceList, 'Instance not created')
    const newInstance = instanceList[0]

    invariant(
        newInstance?.InstanceId && newInstance?.ImageId,
        'Instance not created'
    )

    let instanceId = newInstance.InstanceId
    const imageId = newInstance.ImageId

    const result = await scheduleInstance(instanceId, imageId)

    invariant(result, 'Instance not scheduled')

    return instanceId
}

export async function waitTillInstanceReady(id: string) {
    while (true) {
        const instanceInfo = await ec2Aws.getInstanceStatusById(id)
        if (instanceInfo?.Status === 'ok') {
            break
        }
        console.log('Waiting for instance to be ready...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const info = await ec2Aws.getInstanceInfoById(id)

    invariant(info && info?.PublicIpAddress, 'Instance not found')
    const publicIp = info?.PublicIpAddress

    await updateInstance(id, {
        publicIp,
        status: 'running'
    })

    return true
}
