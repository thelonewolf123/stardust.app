import {
    EC2Client,
    RequestSpotFleetCommand,
    RequestSpotInstancesCommand
} from '@aws-sdk/client-ec2'

const client = new EC2Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ''
    },
    region: 'us-east-1'
})

function requestEc2SpotInstance(count: number) {
    const command = new RequestSpotInstancesCommand({
        InstanceCount: count,
        LaunchSpecification: {
            ImageId: 'ami-02e726886cc4f5795',
            InstanceType: 'm3.medium',
            SecurityGroupIds: ['sg-005992c68c98aeca5']
        },
        SpotPrice: '0.050',
        ValidUntil: new Date(Date.now() + 600_000), // valid for 10 mins from request!
        Type: 'one-time'
    })

    return client.send(command)
}

export { requestEc2SpotInstance }
