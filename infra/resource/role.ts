import * as aws from '@pulumi/aws'

// Create an IAM role that the Spot Fleet can assume
const spotFleetRole = new aws.iam.Role('spotFleetRole', {
    assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'sts:AssumeRole',
                Effect: 'Allow',
                Principal: {
                    Service: 'spotfleet.amazonaws.com'
                }
            }
        ]
    })
})

// Attach the required policy to the role
const spotFleetRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
    'spotFleetRolePolicyAttachment',
    {
        role: spotFleetRole.name,
        policyArn:
            'arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole'
    }
)

// Create an IAM role for the Lambda function
const lambdaRole = new aws.iam.Role('lambdaRole', {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: 'lambda.amazonaws.com'
    })
})

// Attach the AWSLambdaBasicExecutionRole policy to the role
const lambdaRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
    'lambdaRolePolicyAttachment',
    {
        role: lambdaRole.name,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
    }
)

export { spotFleetRole, spotFleetRolePolicyAttachment, lambdaRole }
