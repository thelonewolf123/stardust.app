---
slug: welcome
title: Welcome to Stardust
authors: [thelonewolf123]
tags: [stardust, architecture]
---

Welcome to the Stardust technical documentation site. Here you'll find comprehensive architecture documentation covering every component of the platform.

{/* truncate */}

## What is Stardust?

Stardust is a **container provisioning engine** that deploys Dockerized applications from GitHub repositories onto AWS infrastructure. It provides a complete pipeline from source code to running container with real-time monitoring, SSH access, and automatic lifecycle management.

## Key Features

- **One-click deploy** from any GitHub repository
- **Automatic Docker image building** on EC2 builder instances
- **Container orchestration** on EC2 spot instances with on-demand fallback
- **Real-time log streaming** and browser-based SSH
- **Webhook-triggered rebuilds** on git push
- **Spot instance termination handling** via CloudWatch → Lambda → RabbitMQ

## Architecture Highlights

The system is built with:

- **Next.js 14** frontend with App Router and Apollo Client
- **Express + Apollo Server** GraphQL API
- **MongoDB** with Typegoose for data persistence
- **Redis** for pub/sub, distributed locks, and Lua scripting
- **RabbitMQ** for async job queues
- **Pulumi IaC** for full AWS infrastructure provisioning
- **EC2 Spot Instances** for cost-efficient container hosting

Check the [Architecture Overview](/docs/overview) to get started.
