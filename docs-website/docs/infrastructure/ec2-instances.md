---
sidebar_position: 3
---

# EC2 Instances

## Instance Architecture

Two types of EC2 instances are used:

```mermaid
graph TB
    subgraph "Builder Instance"
        B1[Purpose: Docker Image Builds]
        B2[Docker Engine]
        B3[Git]
        B4[ECR Push Access]
    end
    
    subgraph "Proxy Instance"
        P1[Purpose: Reverse Proxy]
        P2[http-proxy Node.js]
        P3[Redis Client]
        P4[Docker Sock Proxy]
    end
    
    subgraph "Container Instances (Spot + On-Demand)"
        C1[Purpose: Run User Containers]
        C2[Docker Engine]
        C3[ECR Pull Access]
        C4[S3 Upload/Download]
    end
    
    Sched[Scheduler] -->|SSH| B1
    Sched -->|SSH| C1
    App[App Service] -->|Redis| P1
    Internet -->|HTTP| P1
    P1 -->|proxy| C1
```

## Builder Instance

- **Type**: c5.xlarge (or configured via constants)
- **AMI**: Custom AMI with Docker pre-installed
- **Role**: IAM role with ECR push access
- **Lock**: Redlock ensures one build at a time

## Container Instances

- **Type**: Spot instances (with on-demand fallback)
- **AMI**: Same custom AMI as builder
- **Role**: IAM role with ECR pull + S3 access
- **Lifecycle**: Created/destroyed dynamically by the Scheduler
- **Spot handling**: Termination notice → CloudWatch → Lambda → RabbitMQ → Scheduler checkpoint

## Spot Instance Termination Flow

```mermaid
sequenceDiagram
    participant AWS as AWS EC2
    participant CW as CloudWatch
    participant L as Lambda
    participant Q as RabbitMQ
    participant S as Scheduler
    participant R as Redis Pub/Sub
    participant F as Frontend

    AWS->>CW: Spot termination notice (2 min warning)
    CW->>L: Trigger Lambda
    L->>Q: Publish "spot-instance-terminate"
    
    Q->>S: Consume message
    S->>S: Identify containers on instance
    S->>R: Publish: "Instance terminating, checkpointing..."
    R->>F: SSE: termination log
    
    loop Each container
        S->>S: docker checkpoint create
        S->>S3: Upload checkpoint
        S->>MongoDB: status: checkpoint
    end
    
    S->>S: Request new instance (on-demand)
    S->>S: Restore containers from checkpoint
    S->>R: Publish: "Restored on new instance"
    R->>F: SSE: restore log
```
