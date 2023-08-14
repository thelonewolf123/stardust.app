import invariant from 'invariant'

import {
    ERROR_CODES,
    INSTANCE_SCHEDULE_KEY,
    MAX_INSTANCE_STATUS_ATTEMPTS
} from '@constants/aws-infra'
import ec2Aws from '@core/ec2.aws'
import { sleep } from '@core/utils'

import { scheduleContainer } from '../lua/container'
import { scheduleInstance, updateInstance } from '../lua/instance'
import { addLock, releaseLock } from '../lua/lock'

export async function getInstanceForNewContainer(containerSlug: string) {
    let instanceId: null | string
    while (true) {
        instanceId = await scheduleContainer(containerSlug)
        if (instanceId) {
            break
        }

        console.log('instance Id', instanceId)
        const lock = await addLock(INSTANCE_SCHEDULE_KEY)
        console.log('lock: ', lock)
        if (lock === 'added') {
            await scheduleNewInstance(1)
            await releaseLock(INSTANCE_SCHEDULE_KEY)
        }
        await sleep(1000)
    }

    return instanceId
}

export async function scheduleNewInstance(count: number) {
    const instanceList = await ec2Aws.requestEc2OnDemandInstance(count)
    invariant(instanceList, 'Instance not created')
    const newInstance = instanceList[0]

    invariant(
        newInstance?.InstanceId && newInstance?.ImageId,
        'Instance not created'
    )

    let instanceId = newInstance.InstanceId
    const imageId = newInstance.ImageId

    const result = await scheduleInstance(instanceId, imageId)

    invariant(result, 'Instance not scheduled')

    return instanceId
}

export async function waitTillInstanceReady(id: string) {
    let attempts = 0
    while (true) {
        const instanceInfo = await ec2Aws.getInstanceStatusById(id)
        if (instanceInfo?.Status === 'ok') {
            break
        }

        if (attempts > MAX_INSTANCE_STATUS_ATTEMPTS) {
            await updateInstance(id, {
                status: 'failed'
            })
            throw new Error(ERROR_CODES.INSTANCE_PROVISION_FAILED)
        }

        console.log('Waiting for instance to be ready...', instanceInfo)
        await sleep(1000)
    }

    const info = await ec2Aws.getInstanceInfoById(id)

    invariant(info && info?.PublicIpAddress, 'Instance not found')
    const publicIp = info.PublicIpAddress

    await updateInstance(id, {
        publicIp,
        status: 'running'
    })

    return info
}
