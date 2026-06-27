---
sidebar_position: 11
---

# fusion CLI

## Overview

`fusion` is a command-line tool for managing Stardust projects. It wraps the GraphQL API for terminal-based project management.

## Commands

| Command | Description |
|---------|-------------|
| `fusion user:signup` | Sign up / login via GitHub |
| `fusion user:logout` | Clear local session |
| `fusion project:create` | Create a new project |
| `fusion project:list` | List all projects |
| `fusion project:delete` | Delete a project |
| `fusion project:refresh` | Refresh/rebuild a project |
| `fusion container:list` | List all containers |
| `fusion container:create` | Deploy a container |
| `fusion container:stop` | Stop a container |
| `fusion prompt:run` | Interactive guided workflow |

## Usage

```bash
# Login
fusion user:signup

# Create and deploy
fusion project:create \
  --name "my-app" \
  --github "https://github.com/user/repo" \
  --branch "main"

# List projects
fusion project:list

# Deploy a container
fusion container:create --project "my-app"
```

## Architecture

```
cli/
├── index.js           # Entry point
├── constants.js       # GraphQL endpoint, config
├── client/index.js    # GraphQL client (graphql-request)
├── user/index.js      # User commands
├── project/index.js   # Project commands
├── container/index.js # Container commands
└── prompt/index.js    # Interactive prompts (inquirer)
```
