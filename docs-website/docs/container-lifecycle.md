---
sidebar_position: 9
---

# Container Lifecycle

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Container created
    
    Pending --> Building: Scheduler picks up
    Pending --> Failed: Build error
    
    Building --> Running: Docker run success
    Building --> Failed: Build failure
    
    Running --> Checkpoint: User pause / Spot termination
    Checkpoint --> Running: User resume
    Checkpoint --> Terminated: Checkpoint expired
    Checkpoint --> Failed: Checkpoint error
    
    Running --> Terminated: User destroy
    Running --> Failed: Runtime error
    
    Terminated --> [*]
    Failed --> [*]
```

## Lifecycle Phases

### 1. Pending

Container record is created in MongoDB with `status: pending`. A message is published to the `new-container` RabbitMQ queue.

### 2. Building

The Scheduler's `NewContainerStrategy` picks up the message:

1. Acquire a distributed lock on the builder EC2 instance (Redlock)
2. Pull source code from GitHub (via git clone)
3. Build Docker image on the builder instance
4. Push image to ECR
5. Publish build logs to Redis pub/sub (`logger:*` channel)
6. Release the lock

### 3. Running

Once the image is ready:

1. The `BuildImageStrategy` picks a target EC2 instance
2. Pull the image from ECR onto the instance
3. Start the container via Docker (Dockerode over SSH)
4. Register with the reverse proxy
5. Update MongoDB: `status: running`, assign port, instance info

### 4. Checkpointing

When pausing or handling a spot termination:

1. `docker checkpoint create` the running container
2. Upload checkpoint to S3
3. Destroy the running container
4. Set `status: checkpoint` in MongoDB

On resume:
1. Download checkpoint from S3
2. `docker start --checkpoint` on a new instance
3. Re-register with reverse proxy
4. Set `status: running`

### 5. Terminated

Container is permanently stopped:

1. `docker stop` + `docker rm`
2. Optionally push final checkpoint to S3
3. Remove from reverse proxy
4. Set `status: terminated` in MongoDB

## Deployment Flow

```mermaid
sequenceDiagram
    participant Q as RabbitMQ
    participant S as Scheduler
    participant R as Redis
    participant B as Builder EC2
    participant E as ECR
    participant C as Container EC2
    participant D as Database

    S->>Q: Consume "new-container"
    S->>R: Redlock.acquire(builder-lock)
    
    S->>B: SSH: git clone {githubUrl}
    S->>B: SSH: docker build -t {image}
    B-->>S: Build output
    S->>R: PUBLISH logger:{id} build logs
    
    S->>B: SSH: docker push to ECR
    S->>R: Redlock.release(builder-lock)
    
    S->>R: Redlock.acquire(instance-lock)
    S->>C: SSH: docker pull from ECR
    S->>C: SSH: docker run -d -p {port}
    S->>R: Redlock.release(instance-lock)
    
    S->>D: Update container: running, port, host
```

## Container Model

```typescript
interface Container {
  containerSlug: string;       // "username/project-name"
  image: string;               // ECR image URI
  status: ContainerStatus;     // pending | running | checkpoint | terminated | failed
  containerId: string;         // Docker container ID
  checkpointId: string;        // S3 checkpoint reference
  instanceId: string;          // Parent EC2 instance
  port: number;                // Mapped host port
  version: number;             // Deployment version
  command: string[];           // Docker CMD override
  env: Record<string, string>; // Environment variables
  buildArgs: Record<string, string>;
  containerBuildLogs: string[];
  github: {
    commitHash: string;
    commitMessage: string;
  };
}
```
