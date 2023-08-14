import deleteContainerScript from 'inline:./delete.lua'
import getInstanceScript from 'inline:./get-instance.lua'
import scheduleContainerScript from 'inline:./schedule-add.lua'
import updateContainerScript from 'inline:./update.lua'

import { PhysicalHostType } from '@/types'
import { MAX_CONTAINER_PER_INSTANCE } from '@constants/aws-infra'
import redis from '@core/redis'

function scheduleContainer(containerSlug: string) {
    const script = scheduleContainerScript.replace(
        'MAX_CONTAINER_PER_INSTANCE',
        `${MAX_CONTAINER_PER_INSTANCE}`
    )
    return redis.runLuaScript(script, [containerSlug])
}

function deleteContainer(containerSlug: string) {
    return redis.runLuaScript(deleteContainerScript, [containerSlug])
}

function updateContainer(
    containerSlug: string,
    containerData: Partial<PhysicalHostType['containers'][number]>
) {
    return redis.runLuaScript(updateContainerScript, [
        containerSlug,
        JSON.stringify(containerData)
    ])
}

function getInstanceIdByContainerId(containerId: string) {
    return redis.runLuaScript(getInstanceScript, [containerId])
}

export {
    deleteContainer,
    scheduleContainer,
    updateContainer,
    getInstanceIdByContainerId
}
