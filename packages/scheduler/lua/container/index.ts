import deleteContainerScript from 'inline:./delete.lua'
import getContainerScript from 'inline:./get-container.lua'
import getInstanceScript from 'inline:./get-instance.lua'
import scheduleContainerScript from 'inline:./schedule-add.lua'
import scheduleContainerBuildScript from 'inline:./schedule-build.lua'
import updateContainerScript from 'inline:./update.lua'

import { PhysicalHostType } from '@/types'
import { MAX_CONTAINER_PER_INSTANCE } from '@constants/aws-infra'
import redis from '@core/redis'

function scheduleContainer(containerSlug: string) {
    const script = scheduleContainerScript.replace(
        /MAX_CONTAINER_PER_INSTANCE/g,
        MAX_CONTAINER_PER_INSTANCE.toString()
    )
    return redis.runLuaScript('scheduleContainer', script, [containerSlug])
}

function scheduleContainerBuild(args: {
    containerSlug: string
    projectSlug: string
}) {
    const script = scheduleContainerBuildScript.replace(
        /MAX_CONTAINER_PER_INSTANCE/g,
        MAX_CONTAINER_PER_INSTANCE.toString()
    )
    return redis.runLuaScript('scheduleContainerBuild', script, [
        args.containerSlug,
        args.projectSlug
    ])
}

function deleteContainer(containerSlug: string) {
    return redis.runLuaScript('deleteContainer', deleteContainerScript, [
        containerSlug
    ])
}

function updateContainer(
    containerSlug: string,
    containerData: Partial<PhysicalHostType['containers'][number]>
) {
    return redis.runLuaScript('updateContainer', updateContainerScript, [
        containerSlug,
        JSON.stringify(containerData)
    ])
}

function getInstanceIdByContainerId(containerId: string) {
    return redis.runLuaScript('getInstanceIdByContainerId', getInstanceScript, [
        containerId
    ])
}

async function getContainer(
    params:
        | {
              containerSlug: string
              projectSlug?: string
          }
        | {
              containerSlug?: string
              projectSlug: string
          }
): Promise<PhysicalHostType['containers'][number] | null> {
    const { containerSlug, projectSlug } = params
    const result = await redis.runLuaScript(
        'getContainer',
        getContainerScript,
        [containerSlug, projectSlug]
    )

    if (result) {
        return JSON.parse(result)
    }

    return null
}

async function attachDomainToContainer(args: {
    containerSlug: string
    domain: string
    ipAddr: string
    portNumber: number
}): Promise<void> {
    const { containerSlug, portNumber, domain, ipAddr } = args
    const container = await getContainer({ containerSlug })
    if (!container) {
        throw new Error('Container not found')
    }

    const domains = container.domains || []
    const hostPortMap = container.hostPortMap || {}
    hostPortMap[domain] = portNumber
    domains.push(domain)

    await updateContainer(containerSlug, { domains, hostPortMap })
    await redis.client.hset('domainMap', domain, `${ipAddr}:${portNumber}`)
}

export {
    getContainer,
    deleteContainer,
    scheduleContainer,
    updateContainer,
    scheduleContainerBuild,
    attachDomainToContainer,
    getInstanceIdByContainerId
}
