---
sidebar_position: 1
---

# Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    Project ||--o{ Container : "has history"
    Project ||--|| Container : "has current"
    Container ||--|| Instance : "runs on"
    
    User {
        ObjectId id PK
        string username UK
        string email
        int count "JWT version"
        string github_access_token
        date createdAt
        date updatedAt
    }
    
    Project {
        ObjectId id PK
        ObjectId user FK "ref User"
        string name
        string slug UK
        string description
        string githubUrl
        string githubBranch
        string dockerPath
        string dockerContext
        string ecrRepo
        array history "ObjectId[] ref Container"
        ObjectId current FK "ref Container"
        array domains "string[]"
        boolean deleted "soft delete"
        date createdAt
        date updatedAt
    }
    
    Container {
        ObjectId id PK
        string containerSlug UK "username/project-name"
        string image "ECR URI"
        string status "pending|running|checkpoint|terminated|failed"
        string containerId "Docker container ID"
        string checkpointId "S3 checkpoint ref"
        ObjectId instanceId FK "ref Instance"
        int port
        int version
        array command "string[]"
        object env "KV pairs"
        object buildArgs "KV pairs"
        object metaData
        array containerBuildLogs "string[]"
        int containerBuildAttempts
        int containerDeployAttempts
        int containerTerminateAttempts
        string commitHash
        string commitMessage
        ObjectId createdBy FK "ref User"
        boolean deleted "soft delete"
        date createdAt
        date updatedAt
    }
    
    Instance {
        ObjectId id PK
        string amiId
        string instanceId "EC2 instance ID"
        string status "pending|running|stopped|terminated|failed"
        string ipAddress
        string region
        boolean isTerminatedByHealthCheck
        boolean deleted "soft delete"
        date createdAt
        date updatedAt
    }
```

## Mongoose Models (Typegoose)

Models use **Typegoose** — a TypeScript decorator-based wrapper around Mongoose:

```typescript
// Example: Project model
@modelOptions({ schemaOptions: { timestamps: true } })
export class Project {
  @prop({ ref: () => User, required: true })
  user!: Ref<User>;

  @prop({ required: true })
  name!: string;

  @prop({ unique: true, required: true })
  slug!: string;

  @prop()
  description?: string;

  @prop({ required: true })
  githubUrl!: string;

  @prop()
  githubBranch?: string;

  @prop({ ref: () => Container })
  history?: Ref<Container>[];

  @prop({ ref: () => Container })
  current?: Ref<Container>;

  @prop({ type: () => [String], default: [] })
  domains?: string[];

  @prop({ default: false })
  deleted?: boolean;
}
```

## Indexes

| Collection | Index | Purpose |
|-----------|-------|---------|
| User | `username` (unique) | User lookup by username |
| Project | `slug` (unique) | URL-friendly project lookup |
| Container | `containerSlug` (unique) | `"username/project-name"` unique constraint |
| Container | `status` | Filter by status |
| Instance | `instanceId` | EC2 instance ID lookup |

## Soft Deletes

All models implement soft deletes via a `deleted: boolean` field. Queries automatically filter `{ deleted: { $ne: true } }` using a helper in `packages/backend/database/utils.ts`.
