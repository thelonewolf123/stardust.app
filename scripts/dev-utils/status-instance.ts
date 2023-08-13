import ec2Aws from '../../packages/core/ec2.aws'

async function start() {
    const info = await ec2Aws.getInstanceStatusById('i-056b78ae9fb98c47c')
    console.log(JSON.stringify(info, null, 2))
}

start()
