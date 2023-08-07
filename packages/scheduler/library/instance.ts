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
        console.log('instance list', instanceList)
        invariant(instanceList, 'Instance not created')
        const newInstance = instanceList[0]

        invariant(
            newInstance && newInstance.InstanceId && newInstance.ImageId,
            'Instance not created'
        )

        const newInstanceId = newInstance.InstanceId
        const imageId = newInstance.ImageId

        const result = await redis.runLuaScript(scheduleInstanceAdd, [
            newInstanceId,
            imageId
        ])

        invariant(result, 'Instance not scheduled')

        const info = await waitTillInstanceReady(newInstanceId)
        await redis.runLuaScript(instanceUpdate, [
            newInstanceId,
            JSON.stringify({
                status: 'running',
                ipAddress: info?.PublicIpAddress
            })
        ])
        instanceId = await redis.runLuaScript(scheduleContainerAdd, [
            containerSlug
        ])
        invariant(instanceId, 'Instance not scheduled')
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
    return await ec2Aws.getInstanceInfoById(id)
}
