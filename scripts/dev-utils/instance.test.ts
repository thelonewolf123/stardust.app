import ec2Aws from '../../packages/core/ec2.aws'

async function main() {
    ec2Aws.execCommand('ls', '54.87.147.123').then(console.log)
}

main()
