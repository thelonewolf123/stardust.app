import invariant from 'invariant'

import ec2Aws from '@/core/aws/ec2.aws'
import { Ec2InstanceType } from '@/types'

import InstanceStrategyAws from './instance.aws'

class InstanceStrategyAwsSpot extends InstanceStrategyAws {
    pricePerHour: number = 1 // default price - $1 per hour

    constructor(pricePerHour: number) {
        super()
        this.pricePerHour = pricePerHour
    }

    async #scheduleNewInstance(count: number, type: Ec2InstanceType) {
        const requestId = await ec2Aws.requestEc2SpotInstance(
            count,
            this.pricePerHour
        )
        invariant(requestId, 'Instance not created')
        await ec2Aws.waitForSpotInstanceRequest(requestId)
    }
}
