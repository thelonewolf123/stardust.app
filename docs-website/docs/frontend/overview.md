---
sidebar_position: 1
---

# Frontend Overview

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router + RSC |
| React 18 | UI library |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui | Radix-based component library |
| Apollo Client 3 | GraphQL client (HTTP + auth middleware) |
| NextAuth.js 4 | GitHub OAuth authentication |
| xterm.js | Browser terminal emulator |
| react-use-websocket | WebSocket for SSH sessions |
| react-hook-form + zod | Form validation |

## Directory Structure

```
frontend/src/
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout (providers)
│   ├── globals.css            # Tailwind + CSS variables
│   ├── (app)/                 # Authenticated routes
│   │   ├── layout.tsx         # Navbar wrapper
│   │   ├── page.tsx           # Dashboard
│   │   ├── new/               # New project wizard
│   │   ├── project/[username]/ # Project detail
│   │   ├── projects/          # Project listing
│   │   └── settings/          # User settings + billing
│   ├── (auth)/                # Auth routes
│   │   └── login/
│   └── api/auth/[...nextauth]/ # NextAuth API
├── action/                    # Server Actions
│   ├── auth.ts                # authenticateAction, logoutAction
│   ├── project.ts             # pauseProject, resumeProject
│   └── rollback.ts
├── components/
│   ├── internal/              # App-specific components
│   │   ├── common/            # Navbar, theme toggle, logout
│   │   ├── forms/             # Form components
│   │   ├── new/               # New project wizard
│   │   ├── project/           # Project detail
│   │   ├── settings/          # Settings panels
│   │   ├── tabs/              # Build/Container/Terminal
│   │   └── wrapper/           # Apollo, Session, Theme providers
│   └── ui/                    # shadcn/ui primitives
├── data/                      # Data fetching + GraphQL queries
├── hooks/                     # Custom hooks (useAuth)
└── lib/                       # Utilities
    ├── graphql.ts             # Apollo client (browser)
    ├── server-utils.ts        # Apollo client (SSR) + auth
    └── utils.ts               # cn(), parseEnv(), etc.
```

## Layout Hierarchy

```mermaid
graph TB
    Root[Root Layout<br/>html, body, providers] --> AuthCheck{Auth Check}
    AuthCheck -->|Authenticated| AppLayout[App Layout<br/>Navbar + Sidebar]
    AuthCheck -->|Not Auth| Login[Login Page]
    
    AppLayout --> Dashboard[Dashboard /projects]
    AppLayout --> NewProject[New Project Wizard<br/>/new/*]
    AppLayout --> ProjectDetail[Project Detail<br/>/project/[username]/*]
    AppLayout --> Settings[Settings<br/>/settings/*]
    
    subgraph "Providers (Root Layout)"
        Theme[Theme Provider<br/>next-themes]
        Session[Session Provider<br/>NextAuth]
        Apollo[Apollo Provider<br/>GraphQL Client]
    end
    
    subgraph "Project Detail Tabs"
        BuildTab[Build Tab<br/>Logs + Status]
        ContainerTab[Container Tab<br/>Info + Controls]
        TerminalTab[Terminal Tab<br/>xterm.js SSH]
    end
    
    ProjectDetail --> BuildTab
    ProjectDetail --> ContainerTab
    ProjectDetail --> TerminalTab
```

## Routing

| Route | Layout | Purpose |
|-------|--------|---------|
| `/` | `(app)` | Dashboard / project listing |
| `/login` | `(auth)` | GitHub OAuth login |
| `/new` | `(app)` | New project creation wizard |
| `/new/build-args` | `(app)` | Docker build arguments |
| `/new/environment` | `(app)` | Environment variables |
| `/new/meta-data` | `(app)` | Project metadata |
| `/projects` | `(app)` | All projects list |
| `/project/[username]` | `(app)` | Project detail page |
| `/settings` | `(app)` | User settings |
| `/settings/billing` | `(app)` | Billing settings |
