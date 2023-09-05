import { execSync } from 'child_process'

import * as awsx from '@pulumi/awsx'

// Create a repository for container images.
export const ecrRepo = new awsx.ecr.Repository('app-repo', {
    forceDelete: true,
    tags: {
        Name: 'app-repo',
        CommitHash: execSync('git rev-parse HEAD').toString().trim()
    }
})
