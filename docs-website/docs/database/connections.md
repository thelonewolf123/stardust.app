---
sidebar_position: 2
---

# Database Connections

## MongoDB Connection

Connection is established via Mongoose with a cached singleton pattern (`packages/backend/database/mongoose.ts`):

```typescript
let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) return cachedConnection;
  
  cachedConnection = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  return cachedConnection;
}
```

## Redis Connection

Redis is used for multiple purposes (`packages/core/redis.ts`):

| Purpose | Mechanism |
|---------|-----------|
| Distributed locks | Redlock (lock.lua) |
| Pub/sub logging | `PUBLISH logger:{id}` / `SUBSCRIBE logger:{id}` |
| Container scheduling state | Lua scripts for atomic operations |
| Cache | Standard GET/SET with TTL |

### Lua Scripting

Atomic operations for container/instance scheduling state are implemented as Lua scripts:

```
scheduler/lua/
├── container/
│   ├── schedule-add.lua    # Atomically add container to schedule
│   ├── schedule-build.lua  # Mark build in progress
│   ├── get-container.lua   # Get container state
│   ├── get-instance.lua    # Get instance state  
│   ├── update.lua          # Update container state
│   └── delete.lua          # Remove container state
├── instance/
│   └── index.ts
└── lock/
    ├── lock.lua            # Custom locking logic
    └── index.ts
```

### Redlock for Distributed Locking

Two main lock resources:
- **Builder lock**: Ensures only one build runs on the builder EC2 at a time
- **Instance lock**: Ensures atomic container-to-instance assignment

## RabbitMQ Connection

Four queues are managed via a direct exchange (`packages/core/queue.ts`):

| Queue | Routing Key | Purpose |
|-------|-------------|---------|
| `new-container` | `new-container` | Trigger container deployment |
| `build-container` | `build-container` | Trigger Docker image build |
| `destroy-container` | `destroy-container` | Trigger container teardown |
| `spot-instance-terminate` | `spot-instance-terminate` | Handle spot termination |
