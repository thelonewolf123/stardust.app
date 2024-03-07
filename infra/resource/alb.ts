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
const proxyTargetGroup = new awsx.classic.lb.ApplicationTargetGroup(
    'proxyTargetGroup',
    {
        port: 80,
        protocol: 'HTTP',
        targetType: 'ip'
    }
)

export const proxyListener = proxyAlb.createListener('proxy', {
    port: 80,
    external: true,
    targetGroup: proxyTargetGroup
})

const proxyAccelerator = new aws.globalaccelerator.Accelerator(
    'proxy-accelerator',
    {
        enabled: true
    }
)

const proxyAcceleratorListener = new aws.globalaccelerator.Listener(
    'proxy-accelerator-listener',
    {
        acceleratorArn: proxyAccelerator.id,
        portRanges: [
            {
                fromPort: 80,
                toPort: 80
            }
        ],
        protocol: 'TCP'
    }
)

const proxyEndpointGroup = new aws.globalaccelerator.EndpointGroup(
    'proxy-endpoint-group',
    {
        listenerArn: proxyAcceleratorListener.id,
        endpointConfigurations: [
            {
                endpointId: proxyListener.listener.id,
                weight: 100
            }
        ]
    }
)

export const proxyAcceleratorIpAddresses = proxyAccelerator.ipAddresses
