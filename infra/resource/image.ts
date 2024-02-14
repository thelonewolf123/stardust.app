import * as awsx from '@pulumi/awsx'

import { getEnvMap } from '../utils'
import { ecrRepo } from './ecr'

// Build and publish a Docker image to a private ECR registry.
export const appImage = new awsx.ecr.Image('app-img', {
    repositoryUrl: ecrRepo.url,
    context: './docker',
    dockerfile: './docker/Dockerfile.app',
    args: getEnvMap(),
    platform: 'linux/amd64'
})
