import * as awsx from '@pulumi/awsx'

import { getEnvMap } from '../utils'
import { ecrRepo } from './ecr'
import { webListener } from './alb'

// Build and publish a Docker image to a private ECR registry.
export const appImage = new awsx.ecr.Image(
    'app-img',
    {
        repositoryUrl: ecrRepo.url,
        context: './docker',
        dockerfile: './docker/Dockerfile.app',
        args: {
            ...getEnvMap(),
            BACKEND_BASE_URL: webListener.endpoint.hostname
        },
        platform: 'linux/amd64'
    },
    {
        dependsOn: [ecrRepo, webListener]
    }
)
