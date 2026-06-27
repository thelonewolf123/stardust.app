---
sidebar_position: 2
---

# Cron Service

## Overview

The Cron service runs periodic maintenance tasks. It uses `throng` for clustering (one worker) and includes three main controllers.

## Controllers

### instanceHealthCheck

Periodically checks the health of all running EC2 instances:

1. Ping each instance via SSH
2. If unreachable, mark as `terminated`
3. Trigger cleanup of any containers on dead instances

### containerCleanup

Periodically cleans up terminated/failed containers:

1. Find containers with `status: terminated` older than 24h
2. Remove Docker container if still present
3. Clean up S3 checkpoints
4. Soft-delete from MongoDB

### instanceCleanup

Periodically cleans up terminated instances:

1. Find instances with `status: terminated`
2. Terminate the EC2 instance (if still running)
3. Soft-delete from MongoDB

## Schedule

| Task | Interval | Purpose |
|------|----------|---------|
| `instanceHealthCheck` | 5 minutes | Detect dead instances |
| `containerCleanup` | 1 hour | Remove old terminated containers |
| `instanceCleanup` | 1 hour | Terminate and clean up unused instances |
