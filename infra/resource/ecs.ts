// Copyright 2016-2023, Pulumi Corporation.  All rights reserved.
import * as awsx from '@pulumi/awsx'

// Create an ECS Fargate cluster.
export const cluster = new awsx.classic.ecs.Cluster('cluster')
export const proxyCluster = new awsx.classic.ecs.Cluster('proxy-cluster')
