---
sidebar_position: 12
---

# Deployment

## Local Development

Docker Compose for local development is defined in `infra/docker/compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
  
  redis:
    image: redis:7
    ports: ["6379:6379"]
  
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
```

Start locally:
```bash
# Start dependencies
docker compose -f infra/docker/compose.yml up

# Build and run backend services
node scripts/build.js    # esbuild bundles
node dist/backend.js     # Express + Apollo API
node dist/scheduler.js   # Queue consumers
node dist/cron.js        # Scheduled tasks

# Start frontend
cd frontend && npm run dev
```

## Build Pipeline

The project uses a custom esbuild-based build system (`scripts/build.js`) that produces 5 bundles:

| Bundle | Entry | Output |
|--------|-------|--------|
| backend | `packages/backend/index.ts` | `dist/backend.js` |
| scheduler | `packages/scheduler/index.ts` | `dist/scheduler.js` |
| cron | `packages/cron/index.ts` | `dist/cron.js` |
| logger | `packages/logger/index.ts` | `dist/logger.js` |
| lambda | `packages/lambda/index.ts` | `dist/lambda.js` |

## Production (Pulumi)

The entire AWS infrastructure is provisioned via Pulumi. See [Infrastructure Overview](infrastructure/overview.md) for details.

### ECS Fargate Services

| Service | Image | Port | CPU | Memory |
|---------|-------|------|-----|--------|
| App | `stardust-app` | 4000 | 512 | 1024 |
| Scheduler | `stardust-scheduler` | - | 256 | 512 |
| Cron | `stardust-cron` | - | 128 | 256 |
| Logger | `stardust-logger` | - | 128 | 256 |

### Environment Variables

Key env vars (validated via Zod + `@t3-oss/env`):

| Variable | Source |
|----------|--------|
| `MONGODB_URI` | SSM Parameter Store |
| `REDIS_URL` | ElastiCache / internal |
| `RABBITMQ_URL` | CloudAMQP / internal |
| `JWT_SECRET` | SSM Parameter Store |
| `GITHUB_CLIENT_ID/SECRET` | SSM Parameter Store |
| `AWS_REGION` | Pulumi stack config |
| `AWS_*` | Pulumi IAM roles |

### Deploy Commands

```bash
# Deploy infrastructure
cd infra && pulumi up

# Build and push Docker images
cd infra && pulumi up  # (includes image build)

# Frontend deployment
cd frontend && npm run build
# Hosted on Vercel / Cloudflare Pages / S3+CF
```
