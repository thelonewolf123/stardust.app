import instanceCleanup from 'inline:./cleanup.lua'
import scheduleInstanceScript from 'inline:./schedule-add.lua'
import scheduleDeleteScript from 'inline:./schedule-delete.lua'
import instanceUpdate from 'inline:./update.lua'

import { Ec2InstanceType, PhysicalHostType } from '@/types'
import redis from '@core/redis'

function scheduleInstance(
    instanceId: string,
    imageId: string,
    instanceType: Ec2InstanceType
) {
    return redis.runLuaScript(scheduleInstanceScript, [
        instanceId,
        imageId,
        instanceType
    ])
}

function scheduleInstanceDelete(instanceId: string) {
    return redis.runLuaScript(scheduleDeleteScript, [instanceId])
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

async function cleanupInstance(): Promise<string[]> {
    const deletedInstance = await redis.runLuaScript(instanceCleanup, [])
    console.log('deletedInstance', deletedInstance)
    const result = deletedInstance ? JSON.parse(deletedInstance) : []
    return result
}

async function getAllPhysicalHosts(): Promise<PhysicalHostType[]> {
    const hosts = await redis.client.get('physicalHost')
    const result = hosts ? JSON.parse(hosts) : []
    return result
}

export {
    scheduleInstance,
    scheduleInstanceDelete,
    updateInstance,
    cleanupInstance,
    getAllPhysicalHosts
}
