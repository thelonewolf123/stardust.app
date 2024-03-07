import * as aws from '@pulumi/aws'

import { proxyCluster } from './ecs'

export const ec2Vpc = new aws.ec2.Vpc('ec2Vpc', {
    cidrBlock: '10.0.0.0/16',
    tags: {
        Name: 'ec2-vpc'
    }
})

export const vpc = new aws.ec2.VpcPeeringConnection('vpcPeeringConnection', {
    peerVpcId: proxyCluster.vpc.id.apply((id) => id), // replace with your Fargate VPC ID
    vpcId: ec2Vpc.id.apply((id) => id), // replace with your EC2 VPC ID
    autoAccept: true,
    tags: {
        Name: 'ec2-ecs-vpc-peering'
    }
})
