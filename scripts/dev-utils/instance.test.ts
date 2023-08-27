import ec2Aws from '../../packages/core/aws/ec2.aws'

async function main() {
    ec2Aws
        .execCommand({
            command: 'ls',
            args: [],
            ipAddress: ''
        })
        .then(console.log)
}

main()
