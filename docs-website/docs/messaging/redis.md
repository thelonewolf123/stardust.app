---
sidebar_position: 2
---

# Redis

## Usage Overview

Redis serves multiple roles in the architecture:

| Role | Mechanism | Details |
|------|-----------|---------|
| Pub/Sub (Logs) | `PUBLISH/SUBSCRIBE` | Real-time log streaming to SSE endpoints |
| Distributed Locks | Redlock | Builder and instance allocation coordination |
| Container State | Lua Scripts | Atomic scheduling state management |
| Proxy Routing | Key-Value | Container host:port mappings for reverse proxy |

## Pub/Sub for Log Streaming

```mermaid
sequenceDiagram
    participant S as Scheduler / Logger
    participant R as Redis
    participant B as Backend SSE
    participant F as Frontend

    S->>R: PUBLISH logger:{containerId}
    Note over S,R: Channel pattern: logger:*
    
    B->>R: SUBSCRIBE logger:{containerId}
    R-->>B: Message
    
    B->>F: SSE event: data
    Note over F: EventSource handler updates UI
```

## Distributed Locking (Redlock)

Two lock resources are used:

1. **Builder Lock** — `lock:builder:{region}` — Ensures only one Docker build runs at a time on the builder EC2
2. **Instance Lock** — `lock:instance:{instanceId}` — Ensures atomic container-to-instance assignment

```typescript
const lock = await redlock.acquire(['lock:builder:us-east-1'], 300000); // 5 min TTL
try {
  // Run docker build
} finally {
  await lock.release();
}
```

## Lua Scripts for Atomic Operations

```mermaid
graph TB
    subgraph "Redis Lua Scripts"
        L1[schedule-add.lua]
        L2[schedule-build.lua]
        L3[get-container.lua]
        L4[get-instance.lua]
        L5[update.lua]
        L6[delete.lua]
        L7[lock.lua]
    end
    
    subgraph "Operations"
        O1[Add container to schedule<br/>Atomic create + queue]
        O2[Mark build in progress<br/>Prevent duplicate builds]
        O3[Read container state<br/>With TTL awareness]
        O4[Read instance state<br/>With assigned containers]
        O5[Update container<br/>Status + metadata]
        O6[Remove from schedule<br/>Cleanup state]
        O7[Custom lock logic<br/>Beyond Redlock]
    end
    
    L1 --> O1
    L2 --> O2
    L3 --> O3
    L4 --> O4
    L5 --> O5
    L6 --> O6
    L7 --> O7
```

## Lua Script Runner

Scripts are loaded and executed via the `runLuaScript` helper:

```typescript
// packs/core/redis.ts loads scripts and provides:
async function runLuaScript(name: string, keys: string[], args: string[]) {
  // EVALSHA with fallback to EVAL
}
```
