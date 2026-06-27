---
sidebar_position: 2
---

# GraphQL Schema

## Type Definitions

Each resolver module exports `typeDefs` (GraphQL schema strings) and `resolvers`. These are merged at server startup.

### Account

```graphql
type User {
  id: ID!
  username: String!
  email: String
  count: Int           # JWT version counter
  createdAt: DateTime
  updatedAt: DateTime
}

type AuthPayload {
  jwt: String!
  user: User!
}

type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  signupOrLogin(githubToken: String!): AuthPayload!
  logout: Boolean!
}
```

### Project

```graphql
type Project {
  id: ID!
  user: User!
  name: String!
  slug: String!
  description: String
  githubUrl: String!
  githubBranch: String!
  dockerPath: String
  dockerContext: String
  ecrRepo: String
  history: [Container!]
  current: Container
  domains: [String!]!
  createdAt: DateTime
  updatedAt: DateTime
}

input CreateProjectInput {
  name: String!
  description: String
  githubUrl: String!
  githubBranch: String!
  dockerPath: String
  dockerContext: String
  command: [String!]
  env: JSON
  buildArgs: JSON
}

type Query {
  project(slug: String!): Project
  allProjects: [Project!]!
  runningProjects: [Project!]!
  notRunningProjects: [Project!]!
  allGithubRepos: [GithubRepo!]!
  allGithubBranches(repo: String!): [String!]!
}

type Mutation {
  createProject(input: CreateProjectInput!): Project!
  deleteProject(projectId: ID!): Boolean!
  refreshProject(projectId: ID!): Project!
  rollbackProject(projectId: ID!, version: Int!): Project!
  addDomain(projectId: ID!, domain: String!): Project!
  removeDomain(projectId: ID!, domain: String!): Project!
}
```

### Container

```graphql
enum ContainerStatus {
  pending
  running
  checkpoint
  terminated
  failed
}

type Container {
  id: ID!
  containerSlug: String!
  image: String
  status: ContainerStatus!
  containerId: String
  checkpointId: String
  instanceId: String
  port: Int
  version: Int!
  command: [String!]
  env: JSON
  buildArgs: JSON
  metaData: JSON
  containerBuildLogs: [String!]!
  commitHash: String
  commitMessage: String
  createdBy: User!
  createdAt: DateTime
  updatedAt: DateTime
}

type Query {
  container(slug: String!): Container
  containers: [Container!]!
}

type Mutation {
  createContainer(projectId: ID!): Container!
  startContainer(containerId: ID!): Container!
  stopContainer(containerId: ID!): Container!
}
```

## Resolver Module Pattern

Each resolver module follows a consistent pattern:

```
resolvers/
├── account/
│   ├── index.ts     # Combined typeDefs + resolvers export
│   ├── type.ts      # GraphQL type definitions
│   ├── query.ts     # Query resolvers
│   └── mutation.ts  # Mutation resolvers
├── container/
│   └── ...
└── project/
    └── ...
```

## Context Type

```typescript
interface Context {
  user: {
    id: string;
    username: string;
    email: string;
    github_access_token: string;
    count: number;
  };
  res: Response;  // Express response (for cookies)
  publishers: any[];  // Redis publishers
}
```
