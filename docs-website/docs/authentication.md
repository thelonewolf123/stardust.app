---
sidebar_position: 10
---

# Authentication & Authorization

## Auth Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Next.js Frontend
    participant N as NextAuth
    participant GH as GitHub OAuth
    participant SA as Server Actions
    participant API as Apollo API
    participant DB as MongoDB
    participant C as Browser Cookie

    U->>F: Click "Login with GitHub"
    F->>N: /api/auth/signin
    N->>GH: Redirect to GitHub OAuth
    GH->>N: OAuth callback with code
    N->>GH: Exchange code for access token
    
    N-->>F: NextAuth session (JWT)
    F->>SA: authenticateAction(github_token)
    SA->>API: Apollo mutation: signupOrLogin
    
    API->>GH: Verify token (Octokit /user)
    API->>DB: Find or create User
    DB-->>API: User document
    
    API->>API: Generate app JWT (jsonwebtoken)
    API-->>SA: { jwt, user }
    
    SA->>C: Set httpOnly cookie: x-access-token
    SA-->>F: User data
    F->>C: Also store in localStorage
    
    Note over F,API: Every subsequent GraphQL request sends x-access-token header
    Note over API: JWT middleware decodes & attaches req.user
```

## Token Management

| Token | Location | Purpose |
|-------|----------|---------|
| NextAuth JWT | httpOnly cookie | NextAuth session management |
| App JWT | httpOnly cookie + localStorage | GraphQL API authentication |
| GitHub Token | MongoDB (user.github_access_token) | GitHub API calls via Octokit |

## Express JWT Middleware

Every request to the backend passes through JWT middleware that:

1. Extracts token from `x-access-token` header
2. Verifies and decodes the JWT
3. Looks up the user in MongoDB
4. Checks JWT version counter (allows forced logout)
5. Attaches `req.user` for downstream handlers

```typescript
// Simplified middleware structure
app.use(async (req, res, next) => {
  const token = req.headers['x-access-token'];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  
  if (user.count !== decoded.count) {
    return res.status(401).send('Token revoked');
  }
  
  req.user = user;
  next();
});
```

## GraphQL Resolver Context

```typescript
interface Context {
  user: User;          // Authenticated user document
  res: Response;       // Express response (for cookies)
  publishers: Publisher[];  // Redis publishers
}
```

## Server Actions

The frontend uses Next.js Server Actions for auth operations:

| Action | Purpose |
|--------|---------|
| `authenticateAction` | Exchange GitHub token for app JWT, set cookies |
| `logoutAction` | Clear auth cookies |
| `getAccessToken` | Read JWT from cookie for client-side use |
