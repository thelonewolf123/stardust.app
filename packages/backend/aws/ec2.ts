import {
    EC2Client,
    RequestSpotFleetCommand,
    RequestSpotInstancesCommand
} from '@aws-sdk/client-ec2'
import { env } from '../../env'

const client = new EC2Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ''
    },
    region: env.AWS_REGION
})

function requestEc2SpotInstance(count: number) {
    const command = new RequestSpotFleetCommand({
        SpotFleetRequestConfig: {
            SpotPrice: '0.050',
            IamFleetRole:
                'arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole',
            LaunchSpecifications: [
                {
                    ImageId: 'ami-02e726886cc4f5795',
                    SecurityGroups: [{ GroupId: 'sg-005992c68c98aeca5' }],
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

export { requestEc2SpotInstance }
