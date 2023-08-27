import { Client as SSHClient } from 'ssh2'

import { env } from '@/env'
import { InstanceExecArgs } from '@/types'
import {
    DescribeInstancesCommand,
    DescribeInstanceStatusCommand,
    EC2Client,
    RequestSpotFleetCommand,
    RunInstancesCommand,
    TerminateInstancesCommand
} from '@aws-sdk/client-ec2'

import {
    EC2_INSTANCE_TYPE,
    EC2_INSTANCE_USERNAMES,
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

async function requestEc2SpotInstance(count: number) {
    const [ami, securityGroup, keyPairName] = await Promise.all([
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseAmiId),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseSecurityGroup),
        ssmAws.getParameter(SSM_PARAMETER_KEYS.baseKeyParName)
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
    let fullCommand = `${params.command} ${params.args.join(' ')}`
    const ssh = new SSHClient()

    if (params.sudo) {
        fullCommand = `sudo ${fullCommand}`
    }

    if (params.cwd) {
        fullCommand = `cd ${params.cwd} && ${fullCommand}`
    } else {
        fullCommand = `cd /home/${EC2_INSTANCE_USERNAMES} && ${fullCommand}`
    }

    console.log('Full command: ', fullCommand)

    ssh.connect({
        host: params.ipAddress,
        port: 22,
        username: EC2_INSTANCE_USERNAMES, // Modify this if your instance uses a different username
        privateKey: privateKey
    })

    await new Promise<void>((resolve) => ssh.on('ready', resolve))

    const resultPromise = new Promise<string>((resolve, reject) => {
        let output = ''

        // TODO: this code is vulnerable to shell injection, fix it @thelonewolf123
        ssh.exec(
            fullCommand,
            {
                env: params.env,
                pty: true
            },
            (err, stream) => {
                if (err) {
                    reject(err)
                    ssh.end()
                    return
                }

                stream
                    .on('data', (data: Buffer) => {
                        output += data.toString()
                    })
                    .on('end', () => {
                        resolve(output)
                        ssh.end()
                    })
            }
        )

        ssh.on('error', (err) => {
            reject(err)
        })
    })

    return [
        () => {
            ssh.end()
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
    terminateInstance
}
