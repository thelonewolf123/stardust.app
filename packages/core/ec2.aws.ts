import {
    DescribeInstancesCommand,
    DescribeInstanceStatusCommand,
    EC2Client,
    RequestSpotFleetCommand,
    RunInstancesCommand
} from '@aws-sdk/client-ec2'

import {
    EC2_INSTANCE_TYPE,
    SSM_PARAMETER_KEYS
} from '../../constants/aws-infra'
import { env } from '../env'
import ssmAws from './ssm.aws'

const client = new EC2Client({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_ACCESS_KEY_SECRET
    },
    region: env.AWS_REGION
})

async function requestEc2SpotInstance(count: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseSecurityGroup),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseKeyParName)
    ])

    const command = new RequestSpotFleetCommand({
        SpotFleetRequestConfig: {
            SpotPrice: '0.050',
            IamFleetRole:
                'arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole',
            LaunchSpecifications: [
                {
                    ImageId: ami,
                    SecurityGroups: [{ GroupId: securityGroup }],
                    KeyName: keyPairName,
                    InstanceRequirements: {
                        VCpuCount: { Min: 1, Max: 2 },
                        MemoryMiB: { Max: 8192 }
                    }
                }
            ],
            TargetCapacity: count,
            ValidUntil: new Date(Date.now() + 600_000), // valid for 10 mins from request!
            Type: 'one-time'
        }
    })

    return client.send(command)
}

async function requestEc2OnDemandInstance(count: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseSecurityGroup),
        ssmAws.getSSMParameter(SSM_PARAMETER_KEYS.baseKeyParName)
    ])

    const command = new RunInstancesCommand({
        ImageId: ami,
        InstanceType: EC2_INSTANCE_TYPE,
        MinCount: count,
        MaxCount: count,
        KeyName: keyPairName,
        SecurityGroupIds: [securityGroup]
    })

    const instance = await client.send(command)
    return instance.Instances
}

async function getInstanceInfoById(instanceId: string) {
    const command = new DescribeInstancesCommand({
        InstanceIds: [instanceId]
    })
    const info = await client.send(command)
    return info.Reservations?.[0]?.Instances?.[0]
}

async function getInstanceStatusById(instanceId: string) {
    const command = new DescribeInstanceStatusCommand({
        InstanceIds: [instanceId]
    })
    const info = await client.send(command)
    return info.InstanceStatuses?.[0]?.InstanceStatus
}

export default {
    requestEc2SpotInstance,
    requestEc2OnDemandInstance,
    getInstanceInfoById,
    getInstanceStatusById
}
