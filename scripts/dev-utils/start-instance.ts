import ec2 from '../../packages/scheduler/library/ec2.aws'

async function main() {
    const instance = await ec2.requestEc2OnDemandInstance(1)
    console.log(instance)
}

main()
