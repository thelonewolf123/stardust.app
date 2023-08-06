import ec2Aws from '../../packages/scheduler/library/ec2.aws'

async function start() {
    const info = await ec2Aws.getInstanceInfoById('i-056b78ae9fb98c47c')
    console.log(info)
}

start()
