import { Ec2InstanceType, PhysicalHostType } from '@/types'
import redis, { redlock } from '@core/redis'

async function getAllPhysicalHosts(): Promise<PhysicalHostType[]> {
    const hosts = await redis.client.get('physicalHost')
    const result = hosts ? JSON.parse(hosts) : []
    result.forEach((host: PhysicalHostType) => {
        host.createdAt = new Date(host.createdAt)
        host.updatedAt = new Date(host.updatedAt)
        if (host.scheduledForDeletionAt) {
            host.scheduledForDeletionAt = new Date(host.scheduledForDeletionAt)
        }
    })
    return result
}

// Update the 'physicalHost' key in Redis with the modified data
async function updateDataInRedis(data: PhysicalHostType[]) {
    await redis.client.set('physicalHost', JSON.stringify(data))
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

        // Find the instance index using the provided instanceId
        const instanceIndex = data.findIndex(
            (instance) => instance.instanceId === instanceId
        )

        // Check if the instance was found
        if (instanceIndex === -1) {
            // Release the lock if the instance was not found
            await lock.release()
            return null // If it was not found, return null as we cannot update a non-existent instance
        }

        // Get the existing instance object
        const instance = data[instanceIndex]

        // Update the instance object with the provided data
        instance.updatedAt = new Date()
        for (const [key, value] of Object.entries(instanceData)) {
            // @ts-ignore
            instance[key] = value
        }

        // Update the 'physicalHost' key in Redis with the modified data
        await updateDataInRedis(data)

        // Release the lock
        await lock.release()

        // Return the instanceId to confirm that the instance was updated successfully
        return instanceId
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
        const physicalHost = await getAllPhysicalHosts()

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
        let idx = 0
        for (let i = 0; i < physicalHost.length; i++) {
            const instance = physicalHost[i]
            scheduleInstancesDeletion(instance) // Add schedule delete timestamp to instances with no containers or failed status
            if (isScheduledForDeletionPastTwoMinutes(instance)) {
                deletedInstances[idx] = instance.instanceId
                physicalHost.splice(i, 1)
                idx++
            }
        }

        // Update the 'physicalHost' key in Redis with the updated data
        await updateDataInRedis(physicalHost)

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
        await updateDataInRedis(data)

        // Release the lock
        await lock.release()

        // Return the 'instanceId' to confirm that the instance was added successfully
        return instanceId
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

// Main function to schedule an instance for deletion
const scheduleInstanceDelete = async (instanceId: string) => {
    try {
        // Calculate scheduled deletion time
        const scheduledForDeletionAt = new Date(Date.now() + 120_000)

        // Get the current 'physicalHost' data from Redis
        let physicalHost = await getAllPhysicalHosts()

        // Decode the JSON data into a JavaScript object

        // Find the index of the instance with the given instanceId
        const targetInstanceIndex = physicalHost.findIndex(
            (instance: PhysicalHostType) => instance.instanceId === instanceId
        )

        // Check if the instance with the given instanceId was found
        if (targetInstanceIndex === -1) {
            return null // If it was not found, return null as we cannot schedule an instance that doesn't exist
        }

        // Update the 'scheduledForDeletionAt' field of the target instance with the provided value
        physicalHost[targetInstanceIndex].scheduledForDeletionAt =
            scheduledForDeletionAt

        // Update the 'physicalHost' key in Redis with the updated data
        await updateDataInRedis(physicalHost)

        // Return the instanceId to confirm that the instance was scheduled for deletion successfully
        return instanceId
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export {
    scheduleInstance,
    scheduleInstanceDelete,
    updateInstance,
    cleanupInstance,
    getAllPhysicalHosts
}
