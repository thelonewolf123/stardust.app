import { SSM_PARAMETER_KEYS } from '../../constants/aws-infra'
import { env } from '../../packages/env'
import { storeSecret } from './ssm'

export const dockerHostPassword = storeSecret({
    secret: env.REMOTE_DOCKER_PASSWORD,
    key: SSM_PARAMETER_KEYS.dockerRemotePassword
})
