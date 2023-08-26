import ec2Aws from '../../packages/core/aws/ec2.aws'

async function start() {
    const info = await ec2Aws.getInstanceStatusById('i-09275d9470735b31d')
    console.log(info)
}

start()
