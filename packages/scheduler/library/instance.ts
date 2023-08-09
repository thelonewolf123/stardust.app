import invariant from 'invariant'

import { scheduleContainer } from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'
import ec2Aws from './ec2.aws'

export async function getInstanceForNewContainer(containerSlug: string) {
    let instanceId: null | string = await scheduleContainer(containerSlug)
    console.log('instance Id', instanceId)
    if (!instanceId) {
        const instanceList = await ec2Aws.requestEc2OnDemandInstance(1)
        invariant(instanceList, 'Instance not created')
        const newInstance = instanceList[0]

        invariant(
            newInstance &&
                newInstance.InstanceId &&
                newInstance.PublicIpAddress &&
                newInstance.ImageId,
            'Instance not created'
        )

        instanceId = newInstance.InstanceId
        const imageId = newInstance.ImageId

        const result = await scheduleInstance(instanceId, imageId)

        invariant(result, 'Instance not scheduled')

        await waitTillInstanceReady(instanceId)
        const info = await ec2Aws.getInstanceInfoById(instanceId)
        await updateInstance(instanceId, {
            publicIp: info?.PublicIpAddress,
            status: 'running'
        })
    }

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

    return true
}
