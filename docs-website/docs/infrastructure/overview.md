---
sidebar_position: 1
---

# Infrastructure Overview

## Stack

All infrastructure is provisioned via **Pulumi v3** using `@pulumi/aws` and `@pulumi/cloudflare`.

```
infra/
├── index.ts                # Stack composition
├── Pulumi.yaml
├── Pulumi.dev.yaml
├── resource/
│   ├── alb.ts              # Application Load Balancer
│   ├── ami.ts              # Custom AMI from EC2 instance
│   ├── cloudflare.ts       # DNS records
│   ├── cloudwatch.ts       # Event rules
│   ├── ecr.ts              # Docker image registry
│   ├── ecs.ts              # ECS cluster
│   ├── fargate.ts          # Fargate service definitions
│   ├── image.ts            # Docker image build + push
│   ├── instance.ts         # EC2 builder/proxy instances
│   ├── keystore.ts         # SSH keys, Docker passwords
│   ├── lambda.ts           # Spot termination handler
│   ├── proxy.ts            # Reverse proxy setup
│   ├── region.ts           # Region configuration
│   ├── role.ts             # IAM roles
│   ├── s3.ts               # S3 buckets
│   ├── securityGroup.ts    # Security groups
│   ├── ssh.ts              # SSH command helpers
│   └── ssm.ts              # SSM Parameter Store
├── docker/
│   ├── compose.yml         # Local dev Docker Compose
│   ├── Dockerfile.app      # App service Docker image
│   └── Dockerfile.logger   # Logger service Docker image
├── scripts/
└── utils/
```

## Resource Diagram

```mermaid
graph TB
    subgraph "DNS & CDN"
        CF[Cloudflare<br/>A Records + Wildcard]
    end
    
    subgraph "Networking"
        ALB[Application<br/>Load Balancer]
        SG1[Security Group<br/>ALB]
        SG2[Security Group<br/>EC2]
        SG3[Security Group<br/>ECS]
    end
    
    subgraph "Compute"
        EC2B[EC2 Builder<br/>Docker Builds]
        EC2P[EC2 Proxy<br/>Reverse Proxy]
        ECS[ECS Cluster<br/>Fargate]
        L[Lambda<br/>Spot Handler]
    end
    
    subgraph "Fargate Services"
        FA[App Service<br/>:4000]
        FS[Scheduler]
        FC[Cron]
        FL[Logger]
    end
    
    subgraph "Storage"
        ECR[ECR Registry]
        S3[S3 Bucket<br/>Checkpoints]
        SSM[SSM Parameter<br/>Store]
    end
    
    subgraph "IAM"
        IR[IAM Role<br/>Spot Fleet]
        IE[IAM Role<br/>Execution]
    end
    
    subgraph "Monitoring"
        CW[CloudWatch<br/>Event Rules]
    end
    
    CF --> ALB
    ALB --> SG1
    ALB --> FA
    SG2 --> EC2B
    SG2 --> EC2P
    SG3 --> ECS
    ECS --> FA
    ECS --> FS
    ECS --> FC
    ECS --> FL
    
    EC2B --> ECR
    FS --> EC2B
    FS --> EC2P
    
    CW --> L
    L --> SSM
    
    IR --> EC2B
    IE --> ECS
```

## Provisioned Resources

| Resource | Type | Purpose |
|----------|------|---------|
| EC2 Builder | `aws.ec2.Instance` | Docker image building |
| EC2 Proxy | `aws.ec2.Instance` | Reverse proxy to containers |
| AMI | `aws.ami.FromInstance` | Custom AMI snapshot |
| ECS Cluster | `aws.ecs.Cluster` | Fargate service host |
| Fargate: App | `aws.ecs.Service` | Express + Apollo API |
| Fargate: Scheduler | `aws.ecs.Service` | Queue consumers |
| Fargate: Cron | `aws.ecs.Service` | Scheduled tasks |
| Fargate: Logger | `aws.ecs.Service` | Log collector |
| ECR | `aws.ecr.Repository` | Docker image storage |
| S3 | `aws.s3.Bucket` | Container checkpoints |
| ALB | `aws.lb.LoadBalancer` | HTTP routing to Fargate |
| Lambda | `aws.lambda.Function` | Spot termination handler |
| CloudWatch | `aws.cloudwatch.EventRule` | Spot termination notification |
| SSM | `aws.ssm.Parameter` | Secrets and config |
| Cloudflare | `cloudflare.Record` | DNS management |
