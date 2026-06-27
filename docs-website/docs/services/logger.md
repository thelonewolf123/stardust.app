---
sidebar_position: 3
---

# Logger Service

## Overview

The Logger service collects and distributes container logs in real-time via Redis pub/sub.

## Architecture

```
Container (stdout/stderr)
       │
       │ docker logs
       ▼
   Logger Service
       │
       │ PUBLISH logger:{containerId}
       ▼
   Redis Pub/Sub
       │
       ├──► SSE Route (backend)
       │        │ EventSource
       │        ▼
       │    Frontend
       │
       └──► Scheduler
                │
                ▼
            MongoDB (persisted)
```

## Log Flow

```mermaid
sequenceDiagram
    participant C as Container
    participant L as Logger Service
    participant R as Redis
    participant B as Backend SSE
    participant F as Frontend

    C->>L: stdout/stderr
    L->>R: PUBLISH logger:{containerId}
    
    Note over B: Client connects via EventSource
    B->>R: SUBSCRIBE logger:{containerId}
    
    R-->>B: Message
    B-->>F: event: log\ndata: {timestamp, text}
    
    Note over F: Renders in Build Tab / Container Tab
```
