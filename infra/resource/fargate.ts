import * as awsx from '@pulumi/awsx'

import { REPLICAS } from '../../constants/aws-infra'
import { webListener } from './alb'
import { cluster } from './ecs'
import { appImage } from './image'

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
    desiredCount: REPLICAS.APP
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
        desiredCount: REPLICAS.SCHEDULER
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
    desiredCount: REPLICAS.CRON // 1 is the default
})
