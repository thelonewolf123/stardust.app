import * as awsx from '@pulumi/awsx'

// Create a repository for container images.
export const ecrRepo = new awsx.ecr.Repository('repo', {
    forceDelete: true
})
