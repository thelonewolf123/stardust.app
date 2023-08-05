import { z } from 'zod'

import { getDockerClient } from '../docker'
import {
    getInstanceById,
    getInstanceForNewContainer
} from '../library/instance'
import { ContainerSchedulerSchema } from '../schema'

export async function createNewContainer(
    data: z.infer<typeof ContainerSchedulerSchema>
) {
    const instanceId = await getInstanceForNewContainer()
    const docker = await getDockerClient('1.1.1.1')
    console.log('docker', docker)
}
