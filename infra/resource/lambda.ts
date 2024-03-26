import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

import { lambdaRole } from './role'

// Create a Lambda function that will be triggered
const lambdaFunction = new aws.lambda.Function(
    'spotInstanceTerminationTrigger',
    {
        runtime: aws.lambda.Runtime.NodeJS18dX,
        code: new pulumi.asset.AssetArchive({
            '.': new pulumi.asset.FileArchive('../lambda') // Directory with Lambda code
        }),
        timeout: 300,
        handler: 'index.handler',
        role: lambdaRole.arn
    }
)

export { lambdaFunction }
