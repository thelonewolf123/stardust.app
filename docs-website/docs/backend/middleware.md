---
sidebar_position: 3
---

# Middleware & Auth

## JWT Authentication Middleware

Applied globally to all requests. Located in `packages/backend/index.ts`:

```mermaid
flowchart TD
    REQ[Incoming Request] --> H{Has x-access-token?}
    H -->|No| NEXT[Pass through<br/>private resolvers will reject]
    H -->|Yes| DECODE[JWT.verify token]
    DECODE -->|Invalid| ERR[401 Unauthorized]
    DECODE -->|Valid| LOOKUP[Find user in MongoDB]
    LOOKUP -->|Not found| ERR
    LOOKUP -->|Found| CHECK{user.count === token.count?}
    CHECK -->|No| ERR
    CHECK -->|Yes| ATTACH[Attach user to req.user]
    ATTACH --> NEXT
```

## Project Ownership Middleware

Located in `packages/backend/library/index.ts`. Verifies the requesting user owns the project being accessed.

## Rate Limiting & Validation

- **Zod schemas** in `packages/schema/index.ts` validate all queue message payloads
- Input validation in GraphQL resolvers uses TypeScript + GraphQL type system

## Middleware Stack

```
Request
  │
  ├── CORS (express cors)
  ├── Body parser (express json)
  ├── JWT verification (custom)
  │     └── Sets req.user
  ├── Apollo Server middleware
  │     ├── Auth check (in context function)
  │     └── Resolver execution
  └── Response
```
