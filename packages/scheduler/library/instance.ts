import scheduleContainerAdd from 'inline:../lua/container/schedule-add.lua'
import scheduleInstanceAdd from 'inline:../lua/instance/schedule-add.lua'
import instanceUpdate from 'inline:../lua/instance/update.lua'
import invariant from 'invariant'

import { InstanceModel } from '../../backend/database/models/instance'
import ec2Aws from './ec2.aws'
import redis from './redis'

export async function getAllInstances() {
    return await InstanceModel.find({ status: 'running' }).lean()
}

export async function getInstanceForNewContainer(containerSlug: string) {
    let instanceId: null | string = await redis.runLuaScript(
        scheduleContainerAdd,
        [containerSlug]
    )
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
        const [publicIp, imageId] = [
            newInstance.PublicIpAddress,
            newInstance.ImageId
        ]

        const result = await redis.runLuaScript(scheduleInstanceAdd, [
            instanceId,
            publicIp,
            imageId
        ])

        invariant(result, 'Instance not scheduled')

        await waitTillInstanceReady(instanceId)
        await redis.runLuaScript(instanceUpdate, [
            instanceId,
            JSON.stringify({ status: 'running' })
        ])
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
