import instanceCleanup from 'inline:./cleanup.lua'
import scheduleInstanceScript from 'inline:./schedule-add.lua'
import scheduleDeleteScript from 'inline:./schedule-delete.lua'
import instanceUpdate from 'inline:./update.lua'

import { PhysicalHostType } from '../../../types'
import redis from '../../library/redis'

function scheduleInstance(instanceId: string, imageId: string) {
    return redis.runLuaScript(scheduleInstanceScript, [instanceId, imageId])
}

function scheduleInstanceDelete(instanceId: string, amiId: string) {
    return redis.runLuaScript(scheduleDeleteScript, [instanceId, amiId])
}

function updateInstance(
    instanceId: string,
    instanceData: Omit<Partial<PhysicalHostType>, 'containers'>
) {
    return redis.runLuaScript(instanceUpdate, [
        instanceId,
        JSON.stringify(instanceData)
    ])
}

function cleanupInstance() {
    return redis.runLuaScript(instanceCleanup, [])
}

export {
    scheduleInstance,
    scheduleInstanceDelete,
    updateInstance,
    cleanupInstance
}
