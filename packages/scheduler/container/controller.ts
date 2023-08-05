import { z } from 'zod'

import { NewContainerSchema } from '../../backend/modules/container/validator'
import { getDockerClient } from '../docker'

export async function createNewContainer(
    data: z.infer<typeof NewContainerSchema>
) {
    const docker = await getDockerClient('1.1.1.1')
    console.log('docker', docker)
}
