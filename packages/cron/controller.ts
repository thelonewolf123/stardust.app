import invariant from 'invariant';

import models from '@/backend/database';
import { getDockerClient } from '@/core/docker';
import InstanceStrategy from '@/scheduler/library/instance';
import { deleteContainer } from '@/scheduler/lua/container';
import { cleanupInstance, getAllPhysicalHosts, updateInstance } from '@/scheduler/lua/instance';
import { CLOUD_PROVIDER } from '@constants/provider';

const handleErrors = (err: Error) => {
    console.error(err)
}

export const instanceHealthCheck = async () => {
    const allInstance = await getAllPhysicalHosts()
    const instance = new InstanceStrategy(CLOUD_PROVIDER)

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

    const cleanupPromise = deadInstances
        .map(async (instanceId) => {
            const deadInstance = await models.Instance.findOne({
                instanceId
            }).lean()
            invariant(deadInstance, 'Instance not found')

            return [
                models.Container.updateMany(
                    {
                        instanceId: deadInstance._id
                    },
                    {
                        status: 'failed'
                    }
                ),
                updateInstance(instanceId, {
                    status: 'failed'
                }),
                instance.terminateInstance(instanceId)
            ]
        })
        .flat()
        .map((promise) => promise.catch(handleErrors))

    await Promise.all(cleanupPromise)
}

export const containerCleanup = async () => {
    // clean up logic handled in lua script
    console.log('cron: container cleanup')
    const allInstance = await getAllPhysicalHosts()

    allInstance.map(async (instance) => {
        const docker = await getDockerClient(instance.publicIp)
        const runningContainers = instance.containers.filter(
            (c) => c.status === 'running'
        )
        const deadContainersPromise = runningContainers.map(
            async (container) => {
                try {
                    const containerInfo = await docker
                        .getContainer(container.containerId)
                        .inspect()
                    console.log('containerInfo', containerInfo)

                    if (!containerInfo.State.Running) return container
                } catch (err) {
                    console.log((err as Error).message)
                }
            }
        )
        const deadContainers = await Promise.all(deadContainersPromise)
        console.log('deadContainers', deadContainers)

        const cleanupPromise = deadContainers
            .filter(Boolean)
            .map(({ containerId, containerSlug }) => {
                return [
                    docker.getContainer(containerId).remove(),
                    models.Container.updateOne(
                        {
                            containerId
                        },
                        {
                            status: 'failed'
                        }
                    ),
                    deleteContainer(containerSlug)
                ]
            })
            .flat()
            .map((promise) => promise.catch(handleErrors))

        await Promise.all(cleanupPromise)
    })
}

export const instanceCleanup = async () => {
    // clean up logic handled in lua script
    console.log('cron: instance cleanup')
    const instance = new InstanceStrategy(CLOUD_PROVIDER)
    const deletedInstance = await cleanupInstance()

    console.log('deletedInstance', deletedInstance)

    await Promise.all(
        deletedInstance.map(async (instanceId) => {
            await models.Instance.updateOne(
                {
                    instanceId
                },
                {
                    isTerminatedByHealthCheck: true
                }
            )
            return instance.terminateInstance(instanceId).catch(handleErrors)
        })
    )
}
