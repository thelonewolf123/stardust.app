---
sidebar_position: 1
---

# Overview

**Stardust** is a container provisioning engine that deploys Dockerized applications from GitHub repositories onto AWS infrastructure. It provides a complete pipeline from source code to running container, with real-time monitoring, SSH access, and automatic lifecycle management.

## What It Does

- **One-click deploy** from any GitHub repository
- **Automatic Docker image building** on EC2 builder instances
- **Container orchestration** on EC2 spot instances (with on-demand fallback)
- **Real-time log streaming** via SSE (Server-Sent Events)
- **Browser-based SSH** into running containers via WebSocket
- **Webhook-triggered rebuilds** on git push
- **Container checkpointing** for state preservation
- **Spot instance termination handling** via CloudWatch → Lambda → RabbitMQ

## Architecture at a Glance

```
┌─────────────┐    ┌──────────────┐    ┌──────────────────┐
│   Next.js   │    │  Express +   │    │    EC2 Builder   │
│  Frontend   │◄──►│   Apollo     │◄──►│  (Docker Build)  │
│  (App Dir)  │    │  GraphQL API │    └──────────────────┘
└─────────────┘    └───┬───┬───┬──┘
                       │   │   │
              ┌────────┘   │   └────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ MongoDB  │ │  Redis   │ │ RabbitMQ │
        │(Mongoose)│ │(Pub/Sub, │ │(Queues)  │
        │          │ │  Locks)  │ │          │
        └──────────┘ └──────────┘ └────┬─────┘
                                       │
                              ┌────────▼────────┐
                              │   Scheduler     │
                              │  (4 Consumers)  │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │   EC2 Spot /    │
                              │   On-Demand     │
                              │   Instances     │
                              └─────────────────┘
```

## Key Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| API | Express 4, Apollo Server 4 (GraphQL) |
| Database | MongoDB 7 (Mongoose + Typegoose) |
| Cache & Real-time | Redis (ioredis, Redlock, Lua scripting) |
| Job Queue | RabbitMQ (amqplib) |
| Compute | AWS EC2 Spot + On-Demand |
| Orchestration | Docker (via Dockerode over SSH) |
| Infrastructure | Pulumi v3 (AWS + Cloudflare) |
| Auth | NextAuth.js + GitHub OAuth + JWT |

## Services

| Service | Purpose |
|---------|---------|
| **App** | Express + Apollo GraphQL API server |
| **Scheduler** | RabbitMQ queue consumers (container operations) |
| **Cron** | Periodic health checks and cleanup |
| **Logger** | Redis pub/sub log collector |
| **Docker Proxy** | HTTP reverse proxy to user containers |
| **Lambda** | Spot termination event handler |
| **CLI** | `fusion` CLI for project management |
