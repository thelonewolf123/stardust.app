import {
    Ec2InstanceType,
    PhysicalHostRedisType,
    PhysicalHostType
} from '@/types'
import redis, { redlock } from '@core/redis'

async function getAllPhysicalHosts(): Promise<PhysicalHostType[]> {
    const hosts = await redis.client.get('physicalHost')
    const result = hosts ? JSON.parse(hosts) : []
    return result.map((host: PhysicalHostRedisType) => {
        const containers = Array.isArray(host.containers) ? host.containers : []

        return {
            ...host,
            createdAt: new Date(host.createdAt * 1000),
            updatedAt: new Date(host.updatedAt * 1000),
            scheduledForDeletionAt: host.scheduledForDeletionAt
                ? new Date(host.scheduledForDeletionAt * 1000)
                : null,
            containers: containers.map((container) => {
                return {
                    ...container,
                    updatedAt: new Date(container.updatedAt * 1000),
                    scheduledAt: new Date(container.scheduledAt * 1000)
                }
            })
        }
    })
}

function convertToRedisFormat(data: PhysicalHostType[]) {
    return data.map((instance) => {
        return {
            ...instance,
            createdAt: parseInt(`${instance.createdAt.getTime() / 1000}`),
            updatedAt: parseInt(`${instance.updatedAt.getTime() / 1000}`),
            scheduledForDeletionAt: instance.scheduledForDeletionAt
                ? parseInt(
                      `${instance.scheduledForDeletionAt.getTime() / 1000}`
                  )
                : null,
            containers: instance.containers.map((container) => {
                return {
                    ...container,
                    updatedAt: parseInt(
                        `${container.updatedAt.getTime() / 1000}`
                    ),
                    scheduledAt: parseInt(
                        `${container.scheduledAt.getTime() / 1000}`
                    )
                }
            })
        }
    })
}

async function pushToRedis(data: PhysicalHostType[]) {
    await redis.client.set(
        'physicalHost',
        JSON.stringify(convertToRedisFormat(data))
    )
}

async function updateInstance(
    instanceId: string,
    instanceData: Omit<Partial<PhysicalHostType>, 'containers'>
) {
    try {
        // Acquire a lock to ensure atomicity
        const lock = await redlock.acquire(['physicalHostLock'], 10000)

        // Get the current data from Redis
        let data = await getAllPhysicalHosts()

        let hasInstanceUpdated = false
        data = data.map((instance) => {
            if (instance.instanceId === instanceId) {
                hasInstanceUpdated = true
                instance.updatedAt = new Date()
                return { ...instance, ...instanceData }
            }
            return instance
        })

        // Update the 'physicalHost' key in Redis with the modified data
        await pushToRedis(data)

        // Release the lock
        await lock.release()

        // Return the instanceId to confirm that the instance was updated successfully
        return hasInstanceUpdated ? instanceId : null
    } catch (error) {
        console.error('Error updating instance:', error)
        throw error
    }
}

async function cleanupInstance(): Promise<string[]> {
    try {
        // Get the current timestamp in seconds
        const currentTime = new Date().getTime()

        // Acquire a lock to ensure atomicity
        const lock = await redlock.acquire(['physicalHostLock'], 10000)

        // Decode the JSON data into a JavaScript object
        let physicalHost = await getAllPhysicalHosts()

        // Function to check if an instance is scheduled for deletion and past 2 minutes
        const isScheduledForDeletionPastTwoMinutes = (
            instance: PhysicalHostType
        ) => {
            const scheduledForDeletionAt = instance.scheduledForDeletionAt
            if (
                scheduledForDeletionAt !== undefined &&
                scheduledForDeletionAt !== null
            ) {
                if (currentTime - scheduledForDeletionAt.getTime() >= 120_000) {
                    // 120 seconds = 2 minutes
                    return true
                }
            }
            return false
        }

        // Function to add schedule delete timestamp to an instance
        const scheduleInstancesDeletion = (instance: PhysicalHostType) => {
            if (
                (!instance.scheduledForDeletionAt &&
                    instance.containers.length === 0) ||
                instance.status === 'failed'
            ) {
                instance.scheduledForDeletionAt = new Date()
            }
        }

        // Iterate through the 'physicalHost' data and remove instances scheduled for deletion past 2 minutes
        const deletedInstances: string[] = []

        physicalHost = physicalHost.filter((instance) => {
            scheduleInstancesDeletion(instance) // Add schedule delete timestamp to instances with no containers or failed status
            if (isScheduledForDeletionPastTwoMinutes(instance)) {
                deletedInstances.push(instance.instanceId)
                return false
            }
            return true
        })

        // Update the 'physicalHost' key in Redis with the updated data
        await pushToRedis(physicalHost)

        // Release the lock
        await lock.release()

        // Return the instanceIds of the deleted instances (if any)
        return deletedInstances
    } catch (error) {
        console.error('Error cleaning up instances:', error)
        throw error
    }
}

// Main function to add a new instance
async function scheduleInstance(
    instanceId: string,
    instanceType: Ec2InstanceType,
    amiId: string
) {
    try {
        // Acquire a lock to ensure atomicity
        const lock = await redlock.acquire(['physicalHostLock'], 10000)

        // Get the current data from Redis
        let data = await getAllPhysicalHosts()

        // Create a new instance object
        const newInstance: PhysicalHostType = {
            instanceId,
            amiId,
            instanceType,
            publicIp: '',
            scheduledForDeletionAt: null,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            containers: []
        }

        // Insert the new instance into the 'data' object
        data = [...data, newInstance]

        // Update the 'physicalHost' key in Redis with the modified data
        await pushToRedis(data)

        // Release the lock
        await lock.release()

        // Return the 'instanceId' to confirm that the instance was added successfully
        return instanceId
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

const scheduleInstanceDelete = async (instanceId: string, failed?: boolean) => {
    try {
        const lock = await redlock.acquire(['physicalHostLock'], 10000)
        let physicalHost = await getAllPhysicalHosts()
        let updated = false
        physicalHost = physicalHost.map((instance: PhysicalHostType) => {
            if (instance.instanceId === instanceId) {
                instance.scheduledForDeletionAt = new Date(Date.now() + 120_000)
                if (failed) {
                    instance.status = 'failed'
                }
                updated = true
            }

            return instance
        })

        if (!updated) {
            return null // If it was not found, return null as we cannot schedule an instance that doesn't exist
        }

        await pushToRedis(physicalHost)
        await lock.release()

        return instanceId
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export {
    updateInstance,
    cleanupInstance,
    scheduleInstance,
    getAllPhysicalHosts,
    scheduleInstanceDelete
}
