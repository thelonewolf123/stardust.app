import { NodeSSH } from 'node-ssh'

import { env } from '@/env'
import { InstanceExecArgs } from '@/types'
import {
    DescribeInstancesCommand,
    DescribeInstanceStatusCommand,
    DescribeSpotFleetInstancesCommand,
    DescribeSpotInstanceRequestsCommand,
    EC2Client,
    RequestSpotFleetCommand,
    RunInstancesCommand,
    TerminateInstancesCommand
} from '@aws-sdk/client-ec2'
import { SPOT_INSTANCE_REQUIREMENTS } from '@constants/provider'

import {
    EC2_INSTANCE_TYPE,
    EC2_INSTANCE_USERNAME,
    SSM_PARAMETER_KEYS
} from '../../../constants/aws-infra'
import { sleep } from '../utils'
import ssmAws from './ssm.aws'

const client = new EC2Client({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_ACCESS_KEY_SECRET
    },
    region: env.AWS_REGION
})

async function requestEc2SpotInstance(count: number, pricePerHour?: number) {
    const [ami, securityGroup, keyPairName, spotFleetRole] = await Promise.all([
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.userInstanceSecurityGroup),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseKeyParName),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.spotFleetRole)
    ])

    const command = new RequestSpotFleetCommand({
        SpotFleetRequestConfig: {
            SpotPrice: pricePerHour?.toString(),
            IamFleetRole: spotFleetRole,
            LaunchSpecifications: [
                {
                    ImageId: ami,
                    SecurityGroups: [{ GroupId: securityGroup }],
                    KeyName: keyPairName,
                    InstanceRequirements: SPOT_INSTANCE_REQUIREMENTS
                }
            ],
            TargetCapacity: count,
            TerminateInstancesWithExpiration: true
        }
    })

    return client.send(command)
}

async function waitForSpotFleetRequest(requestId: string, count?: number) {
    let attempts = 0
    const maxAttempts = 100
    const interval = 1000

    while (attempts < maxAttempts) {
        const command = new DescribeSpotFleetInstancesCommand({
            SpotFleetRequestId: requestId
        })
        const info = await client.send(command)
        const totalRequestedInstances = info.ActiveInstances?.length || count
        const activeInstanceIds = info.ActiveInstances?.map(
            (instance) => instance.InstanceId
        )?.filter(Boolean)

        if (
            activeInstanceIds &&
            activeInstanceIds.length === totalRequestedInstances
        ) {
            return activeInstanceIds
        }

        await sleep(interval)
    }

    throw new Error('Spot request timed out')
}

async function waitForSpotInstanceRequest(requestId: string) {
    let attempts = 0
    const maxAttempts = 100
    const interval = 1000

    while (attempts < maxAttempts) {
        const command = new DescribeSpotInstanceRequestsCommand({
            SpotInstanceRequestIds: [requestId]
        })
        const info = await client.send(command)
        const totalRequestedInstances = info.SpotInstanceRequests?.length
        const activeInstanceIds = info.SpotInstanceRequests?.map((request) => {
            if (request.State === 'active' && request.InstanceId) {
                return request.InstanceId
            }
        }).filter(Boolean)

        if (
            activeInstanceIds &&
            activeInstanceIds.length === totalRequestedInstances
        ) {
            return activeInstanceIds
        }

        await sleep(interval)
        attempts++
    }

    throw new Error('Spot request timed out')
}

async function requestEc2OnDemandInstance(count: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.userInstanceSecurityGroup),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseKeyParName)
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

async function terminateInstance(instanceId: string) {
    const command = new TerminateInstancesCommand({
        InstanceIds: [instanceId]
    })
    const info = await client.send(command)
    return info.TerminatingInstances?.[0]
}

async function execCommand(params: InstanceExecArgs) {
    const key = SSM_PARAMETER_KEYS.ec2PrivateKey
    const privateKey = await ssmAws.getParameter(key, true)

    const ssh = new NodeSSH()

    if (params.sudo) {
        params.args = [params.command, ...params.args]
        params.command = 'sudo'
    }

    await ssh.connect({
        host: params.ipAddress,
        port: 22,
        username: EC2_INSTANCE_USERNAME, // Modify this if your instance uses a different username
        privateKey: privateKey
    })

    ssh.connection?.on('error', (err) => {
        console.error('SSH connection error:', err)
    })

    let output = ''

    const resultPromise = ssh
        .exec(params.command, params.args, {
            cwd: params.cwd,
            stream: 'both',
            onStdout: (data) => {
                output += data.toString()
                params.onProgress?.(data.toString())
            },
            onStderr: (data) => {
                output += data.toString()
                params.onProgress?.(data.toString())
            },
            execOptions: {
                env: params.env || {},
                pty: true
            }
        })
        .then((result) => {
            // return result.stdout
            return output
        })

    return [
        () => {
            ssh.dispose()
        },
        resultPromise
    ] as const
}

export default {
    execCommand,
    terminateInstance,
    getInstanceInfoById,
    getInstanceStatusById,
    requestEc2SpotInstance,
    waitForSpotFleetRequest,
    waitForSpotInstanceRequest,
    requestEc2OnDemandInstance
}
