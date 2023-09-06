import * as awsx from '@pulumi/awsx'

import { getCommitHash } from '../utils'

const commitHash = getCommitHash()

// Create a repository for container images.
export const ecrRepo = new awsx.ecr.Repository('app-repo', {
    forceDelete: true,
    tags: {
        CommitHash: commitHash
    }
})
