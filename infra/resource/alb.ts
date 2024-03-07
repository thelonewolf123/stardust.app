import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'

import { cluster, proxyCluster } from './ecs'

// Define the Networking for our service.
const alb = new awsx.classic.lb.ApplicationLoadBalancer('net-lb', {
    external: true,
    securityGroups: cluster.securityGroups
})

const proxyAlb = new awsx.classic.lb.ApplicationLoadBalancer('proxy-lb', {
    external: true,
    securityGroups: proxyCluster.securityGroups
})

export const webListener = alb.createListener('web', {
    port: 80,
    external: true
})

export const proxyListener = proxyAlb.createListener('proxy', {
    port: 80,
    external: true
})
