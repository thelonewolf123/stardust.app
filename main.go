package main

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

type configuration struct {
	AMI          string `required:"true"`
	InstanceType string `required:"true" default:"m3.medium"`
	SG           string `required:"true"`
	KeyPair      string `required:"true"`
	Duration     int    `required:"true" default:"1"`
	Account      string `required:"true"`
	FleetRole    string `required:"true" default:"aws-ec2-spot-fleet-role"`
	DryRun       bool   `required:"true" default:"true"`
}

func main() {
	var config configuration
	err := envconfig.Process("spotvpn", &config)
	if err != nil {
		log.Fatal(err.Error())
	}
	svc := ec2.New(session.New())
	input := &ec2.RequestSpotFleetInput{
		SpotFleetRequestConfig: &ec2.SpotFleetRequestConfigData{
			ClientToken:  aws.String("vpn-flix"),
			IamFleetRole: aws.String("arn:aws:iam::" + config.Account + ":role/" + config.FleetRole),
			LaunchSpecifications: []*ec2.SpotFleetLaunchSpecification{
				{
					ImageId:      aws.String(config.AMI),
					InstanceType: aws.String(config.InstanceType),
					KeyName:      aws.String(config.KeyPair),
					SecurityGroups: []*ec2.GroupIdentifier{
						{
							GroupId: aws.String(config.SG),
						},
					},
				},
			},
			SpotPrice:                        aws.String("0.04"),
			TargetCapacity:                   aws.Int64(1),
			TerminateInstancesWithExpiration: aws.Bool(true),
			ValidFrom:                        aws.Time(time.Now()),
			ValidUntil:                       aws.Time(time.Now().Add(time.Duration(config.Duration) * time.Hour)),
		},
		DryRun: aws.Bool(config.DryRun),
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

}
