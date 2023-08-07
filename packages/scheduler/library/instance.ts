import scheduleContainerAdd from 'inline:../lua/container/schedule-add.lua'
import scheduleInstanceAdd from 'inline:../lua/instance/schedule-add.lua'
import instanceUpdate from 'inline:../lua/instance/update.lua'
import invariant from 'invariant'

import { InstanceModel } from '../../backend/database/models/instance'
import ec2Aws from './ec2.aws'
import { runLuaScript } from './redis'

export async function getAllInstances() {
    return await InstanceModel.find({ status: 'running' }).lean()
}

export async function getInstanceForNewContainer(containerSlug: string) {
    let instanceId: null | string = await runLuaScript(scheduleContainerAdd, [
        containerSlug
    ])
    console.log('instance Id', instanceId)
    if (!instanceId) {
        const newInstance = await ec2Aws.requestEc2OnDemandInstance(1)
        invariant(newInstance, 'Instance not created')

        instanceId = newInstance.InstanceId!
        const publicIp = newInstance.PublicIpAddress!
        const imageId = newInstance.ImageId!

        const result = await runLuaScript(scheduleInstanceAdd, [
            instanceId,
            publicIp,
            imageId
        ])

        invariant(result, 'Instance not scheduled')

        await waitTillInstanceReady(instanceId)
        await runLuaScript(instanceUpdate, [
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
