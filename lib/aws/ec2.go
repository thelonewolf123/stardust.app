package aws

import (
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/kelseyhightower/envconfig"
)

type Ec2Instance struct {
	AMI                string `required:"true"`
	InstanceType       string `required:"true" default:"m3.medium"`
	SG                 string `required:"true"`
	KeyPair            string `required:"true"`
	Duration           int    `required:"true" default:"1"`
	Account            string `required:"true"`
	FleetRole          string `required:"true" default:"aws-ec2-spot-fleet-role"`
	DryRun             bool   `required:"true" default:"true"`
	InstanceId         string `required:"false"`
	SpotFleetRequestId string `required:"false"`
}

func (instance *Ec2Instance) CreateEc2Instance() {
	err := envconfig.Process("spotvpn", &instance)
	if err != nil {
		log.Fatal(err.Error())
	}
	svc := ec2.New(session.New())
	input := &ec2.RequestSpotFleetInput{
		SpotFleetRequestConfig: &ec2.SpotFleetRequestConfigData{
			ClientToken:  aws.String("vpn-flix"),
			IamFleetRole: aws.String("arn:aws:iam::" + instance.Account + ":role/" + instance.FleetRole),
			LaunchSpecifications: []*ec2.SpotFleetLaunchSpecification{
				{
					ImageId:      aws.String(instance.AMI),
					InstanceType: aws.String(instance.InstanceType),
					KeyName:      aws.String(instance.KeyPair),
					SecurityGroups: []*ec2.GroupIdentifier{
						{
							GroupId: aws.String(instance.SG),
						},
					},
				},
			},
			SpotPrice:                        aws.String("0.04"),
			TargetCapacity:                   aws.Int64(1),
			TerminateInstancesWithExpiration: aws.Bool(true),
			ValidFrom:                        aws.Time(time.Now()),
			ValidUntil:                       aws.Time(time.Now().Add(time.Duration(instance.Duration) * time.Hour)),
		},
		DryRun: aws.Bool(instance.DryRun),
	}

	log.Println(input)
	result, err := svc.RequestSpotFleet(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return
	}
	fmt.Println(result)
	instance.SpotFleetRequestId = *result.SpotFleetRequestId

}

func (instance *Ec2Instance) WatchEc2InstanceInterrupt() {

}
