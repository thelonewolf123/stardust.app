import * as aws from '@pulumi/aws'

import * as awsInfra from '../../constants/aws-infra'

export const securityGroup = new aws.ec2.SecurityGroup(
    awsInfra.EC2_SECURITY_GROUP_NAME,
    {
        description: `Allow inbound traffic on ports ${awsInfra.EC2_EXPOSED_PORTS.join(
            ', '
        )}} from anywhere and allow all outbound traffic`,
        egress: [
            {
                protocol: '-1', // all protocols
                fromPort: 0, // all ports
                toPort: 0, // all ports
                cidrBlocks: ['0.0.0.0/0']
            }
        ],
        ingress: awsInfra.EC2_EXPOSED_PORTS.map((port) => ({
            fromPort: port,
            toPort: port,
            protocol: 'tcp',
            cidrBlocks: ['0.0.0.0/0']
        }))
    }
)
