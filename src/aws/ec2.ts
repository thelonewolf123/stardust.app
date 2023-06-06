import { EC2Client, RequestSpotInstancesCommand } from '@aws-sdk/client-ec2'

const client = new EC2Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ''
    }
})

async function createEc2Instance(count: number) {
    const input = {
        InstanceCount: 5,
        LaunchSpecification: {
            IamInstanceProfile: {
                Arn: 'arn:aws:iam::123456789012:instance-profile/my-iam-role'
            },
            ImageId: 'ami-1a2b3c4d',
            InstanceType: 'm3.medium',
            SecurityGroupIds: ['sg-1a2b3c4d'],
            SubnetId: 'subnet-1a2b3c4d'
        },
        SpotPrice: '0.050',
        Type: 'one-time'
    }
    const command = new RequestSpotInstancesCommand(input)
    await client.send(command)
}
