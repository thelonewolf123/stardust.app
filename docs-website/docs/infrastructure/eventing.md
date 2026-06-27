---
sidebar_position: 5
---

# Eventing & Monitoring

## Spot Instance Termination Pipeline

```mermaid
flowchart LR
    EC2[EC2 Spot Instance<br/>2-min termination notice] -->|AWS Event| CW[CloudWatch<br/>Event Rule]
    CW -->|Trigger| L[Lambda Function<br/>spot-terminate-handler]
    L -->|Publish| Q[RabbitMQ<br/>spot-instance-terminate]
    Q -->|Consume| S[Scheduler<br/>SpotTerminateStrategy]
    S -->|Checkpoint| C[Container<br/>State Save]
    C -->|Upload| S3[(S3 Bucket)]
    S -->|Restore| N[New Instance<br/>On-Demand Fallback]
```

## Lambda Handler

Two versions exist:
- **JavaScript** at `lambda/index.js` (deployed to AWS)
- **TypeScript** at `packages/lambda/index.ts` (bundled with esbuild)

The Lambda:
1. Receives the CloudWatch event with instance ID
2. Looks up the instance in SSM Parameter Store
3. Publishes a message to the `spot-instance-terminate` RabbitMQ queue
4. Returns success

## Health Check Flow

```mermaid
flowchart TB
    Cron[Cron Service<br/>Every 5 minutes] -->|Query| DB[(MongoDB)]
    DB -->|Running instances| Cron
    
    Cron -->|SSH Ping| I1[Instance 1]
    Cron -->|SSH Ping| I2[Instance 2]
    Cron -->|SSH Ping| I3[Instance 3]
    
    I1 -->|Alive| Cron
    I2 -->|Timeout| Cron
    I3 -->|Alive| Cron
    
    Cron -->|Mark dead| DB
    Cron -->|Checkpoint containers| S[Scheduler]
```

## Cleanup Jobs

| Job | Frequency | Action |
|-----|-----------|--------|
| Container cleanup | 1 hour | Remove terminated containers > 24h old |
| Instance cleanup | 1 hour | Terminate unused instances |
| Checkpoint cleanup | 1 hour | Remove expired checkpoints from S3 |
