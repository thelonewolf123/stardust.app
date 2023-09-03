import * as awsx from '@pulumi/awsx'

import { webListener } from './alb'
import { cluster } from './ecs'
import { appImage } from './image-docker'

// Create a Fargate service task that can scale out.
export const appService = new awsx.classic.ecs.FargateService('app-svc', {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: appImage.imageUri,
            command: ['node', 'dist/backend.bundle.js'],
            cpu: 256 /*25% of 1024*/,
            memory: 512 /*MB*/,
            portMappings: [webListener]
        }
    },
    desiredCount: 2
})

export const schedulerService = new awsx.classic.ecs.FargateService(
    'scheduler-svc',
    {
        cluster,
        taskDefinitionArgs: {
            container: {
                image: appImage.imageUri,
                command: ['node', 'dist/scheduler.bundle.js'],
                cpu: 256 /*25% of 1024*/,
                memory: 512 /*MB*/
            }
        },
        desiredCount: 5
    }
)

export const cronService = new awsx.classic.ecs.FargateService('cron-svc', {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: appImage.imageUri,
            command: ['node', 'dist/cron.bundle.js'],
            cpu: 256 /*25% of 1024*/,
            memory: 512 /*MB*/
        }
    },
    desiredCount: 1
})
