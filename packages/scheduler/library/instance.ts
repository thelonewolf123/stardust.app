import scheduleAdd from 'inline:../lua/container/schedule-add.lua'
import { nanoid } from 'nanoid'

import { InstanceModel } from '../../backend/database/models/instance'
import { runLuaScript } from './redis'

export async function getAllInstances() {
    return await InstanceModel.find({ status: 'running' }).lean()
}

export async function getInstanceForNewContainer() {
    const instanceId: null | string = await runLuaScript(scheduleAdd, [
        nanoid()
    ])
    console.log('instance Id', instanceId)

    return instanceId
}

export async function getInstanceById(id: string) {
    // const instance = await InstanceModel.findOne({ instanceId: id })
}
