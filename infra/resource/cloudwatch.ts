import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

import { lambdaFunction } from './lambda'

// Create a CloudWatch Event Rule to trigger on Spot Instance interruption warning
const spotTerminationNoticeRule = new aws.cloudwatch.EventRule(
    'spotTerminationNoticeRule',
    {
        eventPattern: JSON.stringify({
            source: ['aws.ec2'],
            'detail-type': ['EC2 Spot Instance Interruption Warning']
        })
    }
)

// Grant the CloudWatch Event Rule permission to invoke the Lambda function
const permission = new aws.lambda.Permission('permission', {
    action: 'lambda:InvokeFunction',
    function: lambdaFunction.arn,
    principal: 'events.amazonaws.com',
    sourceArn: spotTerminationNoticeRule.arn
})

// Create a CloudWatch Event Target to link the rule to the Lambda function
const target = new aws.cloudwatch.EventTarget('target', {
    rule: spotTerminationNoticeRule.name,
    arn: lambdaFunction.arn
})

export { spotTerminationNoticeRule, permission, target }
// Path: infra/resource/lambda.ts
