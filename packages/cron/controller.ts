import invariant from 'invariant'

import redis from '@/core/redis'
import { cleanupInstance } from '@/scheduler/lua/instance'
import { InstanceModel } from '@models/instance'

export const instanceHealthCheck = async () => {
    const allInstance = await InstanceModel.find({
        status: 'running'
    }).lean()
    const inactiveInstance = await Promise.all(
        allInstance.map(async (instance) => {
            try {
                const data = await fetch(
                    `http://${instance.ipAddress}/_health`
                ).then((r) => r.json())
                invariant(data.ok, 'Instance is not healthy')
            } catch (err) {
                console.log((err as Error).message)
                return instance
            }
        })
    )
    const result = inactiveInstance.filter(Boolean)
    console.log('health-check', result)
}

export const instanceCleanup = async () => {
    // clean up logic handled in lua script
    console.log('cron: instance cleanup')
    const deletedInstance = await cleanupInstance()
    const deletedInstanceObj = deletedInstance
        ? JSON.parse(deletedInstance)
        : []
    console.log('deletedInstance', deletedInstanceObj)
}
