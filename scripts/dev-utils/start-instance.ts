import ec2Aws from '../../packages/core/ec2.aws'

async function main() {
    const instance = await ec2Aws.requestEc2OnDemandInstance(1)
    console.log(instance)
}

main()
