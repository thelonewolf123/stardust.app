import scheduleContainerAdd from 'inline:../lua/container/schedule-add.lua'
import scheduleInstanceAdd from 'inline:../lua/instance/schedule-add.lua'
import instanceUpdate from 'inline:../lua/instance/update.lua'

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
        instanceId = newInstance?.InstanceId!
        const publicIp = newInstance?.PublicIpAddress!
        const imageId = newInstance?.ImageId!

        const _ = await runLuaScript(scheduleInstanceAdd, [
            instanceId,
            publicIp,
            imageId
        ])

        while (true) {
            const instanceInfo = await ec2Aws.getInstanceStatusById(
                newInstance?.InstanceId!
            )
            if (instanceInfo?.Status === 'ok') {
                await runLuaScript(instanceUpdate, [
                    instanceId,
                    JSON.stringify({ status: 'running' })
                ])
                break
            }
            console.log('Waiting for instance to be ready...')
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }
    return instanceId
}

export async function getInstanceById(id: string) {
    const instance = await InstanceModel.findOne({ instanceId: id })
}
