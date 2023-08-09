import deleteContainerScript from 'inline:./delete.lua'
import scheduleContainerScript from 'inline:./schedule-add.lua'
import updateContainerScript from 'inline:./update.lua'

import { PhysicalHostType } from '@/types'
import redis from '@core/redis'

function scheduleContainer(containerSlug: string) {
    return redis.runLuaScript(scheduleContainerScript, [containerSlug])
}

function deleteContainer(containerId: string) {
    return redis.runLuaScript(deleteContainerScript, [containerId])
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

export { deleteContainer, scheduleContainer, updateContainer }
