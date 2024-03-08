import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'

import { cluster } from './ecs'

// Define the Networking for our service.
const alb = new awsx.classic.lb.ApplicationLoadBalancer('net-lb', {
    external: true,
    securityGroups: cluster.securityGroups
})

export const webListener = alb.createListener('web', {
    port: 80,
    external: true
})
