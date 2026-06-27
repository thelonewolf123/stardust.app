---
sidebar_position: 4
---

# REST Routes

Beyond GraphQL, the backend exposes several REST routes for real-time and webhook functionality:

## SSE Log Streaming

```
GET /api/build/:username/:id/logs
GET /api/container/:username/:id/logs
```

These endpoints provide **Server-Sent Events (SSE)** for streaming build and container logs in real-time.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as SSE Route
    participant P as Redis Publisher
    participant S as Scheduler

    F->>R: GET /api/build/{user}/{id}/logs
    Note over R: Set headers: Content-Type: text/event-stream
    
    S->>P: PUBLISH logger:{id} "Build step 1/5..."
    P->>R: SUBSCRIBE logger:{id}
    R-->>F: event: log\ndata: Build step 1/5...
    
    S->>P: PUBLISH logger:{id} "Build step 2/5..."
    P-->>R: data: Build step 2/5...
    R-->>F: event: log\ndata: Build step 2/5...
    
    S->>P: PUBLISH logger:{id} "Done"
    P-->>R: data: Done
    R-->>F: event: done
    
    Note over F: EventSource closes
```

## WebSocket SSH

```
WS /api/container/:username/:id/ssh
```

Provides an interactive shell into running containers from the browser.

```mermaid
sequenceDiagram
    participant F as Frontend (xterm.js)
    participant W as WebSocket Route
    participant C as Container EC2

    F->>W: WebSocket connect
    W->>C: SSH connection (ssh2)
    
    loop Interactive session
        F->>W: Terminal input (keypress)
        W->>C: stdin
        C->>W: stdout
        W->>F: WebSocket message
        F->>F: xterm.write(data)
    end
    
    F->>W: Close WebSocket
    W->>C: Close SSH
```

## GitHub Webhook

```
POST /api/webhook/:username/:id/trigger
```

Receives GitHub push events and triggers automatic container rebuild:

1. Verify webhook secret
2. Look up project and current container
3. Publish `build-container` queue message
4. Return 200 OK

## Key Backend Libraries

| Library | File | Purpose |
|---------|------|---------|
| Dockerode | `packages/core/docker.ts` | Docker client over SSH to EC2 |
| Queue | `packages/core/queue.ts` | RabbitMQ channel + queue setup |
| Redis | `packages/core/redis.ts` | Client, Redlock, Lua script runner |
| EC2 | `packages/core/aws/ec2.aws.ts` | AWS EC2 SDK client |
| ECR | `packages/core/aws/ecr.aws.ts` | AWS ECR SDK client |
| S3 | `packages/core/aws/s3.aws.ts` | AWS S3 SDK client |
| SSM | `packages/core/aws/ssm.aws.ts` | AWS SSM Parameter Store client |
| GitHub | `packages/backend/library/github.ts` | Octokit REST client |
