import { NodeSSH } from 'node-ssh'
import { Client as SSHClient } from 'ssh2'

import { env } from '@/env'
import { InstanceExecArgs } from '@/types'
import {
    DescribeInstancesCommand,
    DescribeInstanceStatusCommand,
    DescribeSpotFleetRequestsCommand,
    EC2Client,
    RequestSpotFleetCommand,
    RunInstancesCommand,
    TerminateInstancesCommand
} from '@aws-sdk/client-ec2'

import {
    EC2_INSTANCE_TYPE,
    EC2_INSTANCE_USERNAME,
    SSM_PARAMETER_KEYS
} from '../../../constants/aws-infra'
import ssmAws from './ssm.aws'

const client = new EC2Client({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_ACCESS_KEY_SECRET
    },
    region: env.AWS_REGION
})

async function requestEc2SpotInstance(count: number, pricePerHour: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseSecurityGroup),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseKeyParName)
    ])

    const command = new RequestSpotFleetCommand({
        SpotFleetRequestConfig: {
            SpotPrice: pricePerHour.toString(),
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

async function waitForSpotInstanceRequest(requestId: string) {
    let attempts = 0
    const maxAttempts = 10
    const interval = 1000

    while (attempts < maxAttempts) {
        const command = new DescribeSpotFleetRequestsCommand({
            SpotFleetRequestIds: [requestId]
        })
        const info = await client.send(command)
        const request = info.SpotFleetRequestConfigs?.[0]

        if (request?.SpotFleetRequestState === 'active') {
            return request
        }

        await new Promise((resolve) => setTimeout(resolve, interval))
        attempts++
    }

    throw new Error('Spot request timed out')
}

async function requestEc2OnDemandInstance(count: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseSecurityGroup),
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
        params.command = 'sudo'
        params.args = [params.command, ...params.args]
    }

    await ssh.connect({
        host: params.ipAddress,
        port: 22,
        username: EC2_INSTANCE_USERNAME, // Modify this if your instance uses a different username
        privateKey: privateKey
    })

    let output = ''

    // TODO: this code is vulnerable to shell injection, fix it @thelonewolf123
    const resultPromise = ssh.exec(params.command, params.args, {
        cwd: params.cwd,
        onStdout: (data) => {
            output += data.toString()
            params.onProgress?.(data.toString())
        },
        onStderr: (data) => {
            output += data.toString()
            params.onProgress?.(data.toString())
        },
        execOptions: {
            env
        }
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
    requestEc2SpotInstance,
    requestEc2OnDemandInstance,
    getInstanceInfoById,
    getInstanceStatusById,
    waitForSpotInstanceRequest,
    terminateInstance
}
