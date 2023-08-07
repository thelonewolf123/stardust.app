import invariant from 'invariant'

import { InstanceModel } from '../backend/database/models/instance'

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
