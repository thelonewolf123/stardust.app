---
sidebar_position: 3
---

# Real-time Systems

## Overview

Three real-time mechanisms provide live interaction:

| Mechanism | Protocol | Use Case |
|-----------|----------|----------|
| SSE | HTTP EventSource | Build logs, container logs |
| WebSocket | WS | SSH terminal into containers |
| Redis Pub/Sub | TCP | Internal event distribution |

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Browser)"
        ES[EventSource<br/>Build Logs]
        ES2[EventSource<br/>Container Logs]
        WS[WebSocket<br/>SSH Terminal]
    end
    
    subgraph "Backend (Express)"
        SSR1[SSE Route<br/>GET /api/build/*/logs]
        SSR2[SSE Route<br/>GET /api/container/*/logs]
        WSR[WebSocket Route<br/>WS /api/*/ssh]
    end
    
    subgraph "Internal"
        RP[Redis Pub/Sub<br/>logger:* channels]
        SS[ssh2 Client<br/>SSH to EC2]
    end
    
    subgraph "EC2"
        B[Builder Instance<br/>Docker build output]
        C[Container Instance<br/>stdout/stderr]
        CSH[Container Shell<br/>bash]
    end
    
    ES --> SSR1
    SSR1 --> RP
    RP --> B
    
    ES2 --> SSR2
    SSR2 --> RP
    RP --> C
    
    WS --> WSR
    WSR --> SS
    SS --> CSH
```

## SSE Log Streaming Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend SSE
    participant R as Redis
    participant S as Scheduler

    F->>B: new EventSource(url)
    B->>R: SUBSCRIBE logger:{id}
    
    S->>R: PUBLISH logger:{id} "Step 1: Cloning repo..."
    R-->>B: Message
    B-->>F: event: log\ndata: Step 1: Cloning repo...
    
    S->>R: PUBLISH logger:{id} "Step 2: Building image..."
    R-->>B: Message
    B-->>F: event: log\ndata: Step 2: Building image...
    
    S->>R: PUBLISH logger:{id} "__BUILD_DONE__"
    R-->>B: Message
    B-->>F: event: done
    
    Note over F: EventSource.onmessage handles rendering
```

## WebSocket SSH Flow

```mermaid
sequenceDiagram
    participant F as Frontend (xterm.js)
    participant B as Backend WS
    participant SSH as ssh2 Client
    participant C as Container Shell

    Note over F: User opens Terminal tab
    F->>F: new Terminal()
    F->>B: new WebSocket(url)
    
    B->>SSH: ssh.connect(host, key)
    SSH->>C: shell session
    
    loop Interactive
        F->>B: WS message (keypress data)
        B->>SSH: stdin.write(data)
        C->>SSH: stdout data
        SSH->>B: Data event
        B->>F: WS message
        F->>F: terminal.write(data)
    end
    
    F->>B: WS close
    B->>SSH: session.close()
```
