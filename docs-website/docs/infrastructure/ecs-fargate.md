---
sidebar_position: 2
---

# ECS Fargate Services

## Service Definitions

Four Fargate services run the backend microservices.

```mermaid
graph TB
    subgraph "ECS Cluster (stardust)"
        subgraph "App Service"
            A1[Task: stardust-app<br/>:4000]
            A2[Health Check<br/>/health]
        end
        
        subgraph "Scheduler Service"
            S1[Task: stardust-scheduler<br/>4 Queue Consumers]
            S2[Connects to<br/>RabbitMQ + EC2]
        end
        
        subgraph "Cron Service"
            C1[Task: stardust-cron<br/>Scheduled Jobs]
            C2[Health Checks<br/>Cleanups]
        end
        
        subgraph "Logger Service"
            L1[Task: stardust-logger<br/>Redis Subscriber]
            L2[Collects Logs<br/>from Containers]
        end
    end
    
    ALB[Application Load Balancer] -->|:80 → :4000| A1
    A1 --> MongoDB[(MongoDB)]
    A1 --> Redis[(Redis)]
    A1 --> RMQ[RabbitMQ]
    S1 --> RMQ
    S1 --> EC2[EC2 Instances]
    C1 --> MongoDB
    L1 --> Redis
    L1 --> EC2
```

## Task Configuration

| Service | CPU | Memory | Desired Count |
|---------|-----|--------|---------------|
| App | 512 | 1024 | 2 (HA) |
| Scheduler | 256 | 512 | 1 |
| Cron | 128 | 256 | 1 |
| Logger | 128 | 256 | 1 |

## Image Build

Docker images are built and pushed to ECR as part of the Pulumi deployment (`infra/resource/image.ts`):

```dockerfile
# Dockerfile.app
FROM node:20-slim
WORKDIR /app
COPY dist/backend.js .
COPY node_modules node_modules
EXPOSE 4000
CMD ["node", "backend.js"]
```
