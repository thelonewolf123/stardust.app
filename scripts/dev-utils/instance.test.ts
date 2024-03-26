import ec2Aws from '../../packages/core/aws/ec2.aws'

async function main() {
    const request = await ec2Aws.requestEc2SpotInstance(1)
    const id = request.SpotFleetRequestId
    console.log(`Spot Fleet Request ID: ${id}`)
    if (!id) {
        throw new Error('Spot Fleet Request ID not found')
    }
    const instanceIds = await ec2Aws.waitForSpotFleetRequest(id)
    console.log(`Instance IDs: ${instanceIds.join(', ')}`)
}

main()
