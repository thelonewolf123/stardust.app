import invariant from 'invariant'

import { getDockerClient } from '@/core/docker'
import InstanceStrategy from '@/scheduler/library/instance'
import { cleanupInstance, getAllPhysicalHosts } from '@/scheduler/lua/instance'
import { CLOUD_PROVIDER } from '@constants/provider'

export const instanceHealthCheck = async () => {
    const allInstance = await getAllPhysicalHosts()
    const inactiveInstance = await Promise.all(
        allInstance
            .filter(({ status }) => status === 'running')
            .map(async (instance) => {
                try {
                    const docker = await getDockerClient(instance.publicIp)
                    const containers = await docker.listContainers()
                    console.log('containers', containers)
                } catch (err) {
                    console.log((err as Error).message)
                    return instance
                }
            })
    )
    const deadInstances = inactiveInstance
        .filter(Boolean)
        .map(({ instanceId }) => instanceId)
    console.log('health-check', deadInstances)
}

export const instanceCleanup = async () => {
    // clean up logic handled in lua script
    console.log('cron: instance cleanup')
    const instance = new InstanceStrategy(CLOUD_PROVIDER)
    const deletedInstance = await cleanupInstance()

    console.log('deletedInstance', deletedInstance)

    await Promise.all(
        deletedInstance.map(async (instanceId) => {
            return instance.terminateInstance(instanceId)
        })
    )
}
