---
sidebar_position: 1
---

# RabbitMQ Messaging

## Queue Architecture

RabbitMQ provides async job processing with a **direct exchange** and **four queues**.

```mermaid
graph TB
    subgraph "RabbitMQ Direct Exchange"
        EX[stardust Exchange<br/>type: direct]
    end
    
    subgraph "Publishers"
        API[Apollo API<br/>publishes on mutation]
        CW[CloudWatch Lambda<br/>spot termination]
        WH[GitHub Webhook<br/>rebuild trigger]
    end
    
    subgraph "Queues"
        Q1[Queue: new-container<br/>RK: new-container]
        Q2[Queue: build-container<br/>RK: build-container]
        Q3[Queue: destroy-container<br/>RK: destroy-container]
        Q4[Queue: spot-instance-terminate<br/>RK: spot-instance-terminate]
    end
    
    subgraph "Consumers (Scheduler)"
        S1[NewContainerStrategy]
        S2[BuildImageStrategy]
        S3[DestroyContainerStrategy]
        S4[SpotTerminateStrategy]
    end
    
    API -->|publish new-container| EX
    API -->|publish destroy-container| EX
    WH -->|publish build-container| EX
    CW -->|publish spot-instance-terminate| EX
    
    EX --> Q1
    EX --> Q2
    EX --> Q3
    EX --> Q4
    
    Q1 --> S1
    Q2 --> S2
    Q3 --> S3
    Q4 --> S4
```

## Queue Details

| Queue | Consumer | Max Retries | Visibility Timeout |
|-------|----------|-------------|-------------------|
| `new-container` | NewContainerStrategy | 3 | 30 min |
| `build-container` | BuildImageStrategy | 3 | 30 min |
| `destroy-container` | DestroyContainerStrategy | 2 | 5 min |
| `spot-instance-terminate` | SpotTerminateStrategy | 1 | 10 min |

## Message Payload

Messages are validated with Zod schemas:

```typescript
// Example: new-container message
{
  containerId: "abc123",
  projectId: "proj_456",
  userId: "user_789",
  timestamp: "2024-01-01T00:00:00Z"
}
```

## Queue Module

Located in `packages/core/queue.ts`. Manages:

- Connection setup (amqplib)
- Channel creation
- Exchange declaration (direct)
- Queue binding with routing keys
- Message publishing
- Consumer setup with retry logic
