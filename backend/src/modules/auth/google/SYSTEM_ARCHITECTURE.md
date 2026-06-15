# Google OAuth System Architecture

This document provides comprehensive architecture documentation for the Google OAuth authentication system.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Interaction](#component-interaction)
3. [Authentication Flows](#authentication-flows)
4. [Security Architecture](#security-architecture)
5. [Data Models](#data-models)
6. [Extensible Design](#extensible-design)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  UI Layer                                                │   │
│  │  - Login/Register Components                            │   │
│  │  - Protected Routes                                     │   │
│  │  - Dashboard/User Pages                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↑     ↓                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Service Layer                                           │   │
│  │  - AuthService (API calls)                             │   │
│  │  - Axios interceptors (token refresh)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↑     ↓                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  State Management                                        │   │
│  │  - AuthContext (user state)                            │   │
│  │  - Session management                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↑     ↓                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Google OAuth Integration                               │   │
│  │  - @react-oauth/google library                         │   │
│  │  - Google Sign-In button/popup                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HTTP Layer (Express)                                    │   │
│  │  - Route handlers                                       │   │
│  │  - Middleware (CORS, auth validation)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│            ↑                    ↑                  ↑              │
│       /auth/*              /google/*        /protected/*         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth Modules                                            │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Local Auth Module                               │ │   │
│  │  │  - signup, login, password reset                │ │   │
│  │  │  - JWT generation                               │ │   │
│  │  │  - AuthController, AuthService                 │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Google OAuth Module                             │ │   │
│  │  │  - Token verification                            │ │   │
│  │  │  - User creation/linking                         │ │   │
│  │  │  - GoogleAuthService, GoogleAuthController      │ │   │
│  │  │  - OAuth routes & validators                    │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  (Future)                                               │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  GitHub/Facebook/Discord OAuth Modules           │ │   │
│  │  │  (Same architecture pattern)                      │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Utility Layer                                           │   │
│  │  - JWT signing/verification                             │   │
│  │  - Password hashing                                     │   │
│  │  - Token hashing                                        │   │
│  │  - Cookie management                                   │   │
│  │  - Error handling                                       │   │
│  │  - Async middleware                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (Drizzle ORM)                         │   │
│  │  - Query builder                                         │   │
│  │  - Type-safe queries                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database Layer (PostgreSQL)                             │   │
│  │  - users table                                           │   │
│  │  - refresh_tokens table                                │   │
│  │  - password_reset_tokens table                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      Google OAuth Services                       │
│                                                                   │
│  - Google Sign-In (Frontend)                                    │
│  - Google OAuth 2.0 Authorization Server                        │
│  - Google Token Endpoint                                        │
│  - Google UserInfo Endpoint                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction

### Authentication Flow Architecture

#### 1. Local Authentication Flow

```
User submits credentials (email, password)
           ↓
    AuthController.login()
           ↓
    AuthService.login()
           ├─ Query user by email
           ├─ Compare password hash
           ├─ Generate JWT tokens
           │  ├─ signAccessToken() → 15min expiry
           │  └─ signRefreshToken() → 30 days expiry
           ├─ Hash refresh token
           ├─ Store hashed token in DB
           └─ Return tokens & user
           ↓
    setAuthCookies()
           ├─ access_token (httpOnly, secure)
           └─ refresh_token (httpOnly, secure)
           ↓
    Frontend stores in cookies automatically
           ↓
    User authenticated ✓
```

#### 2. Google OAuth Flow

```
User clicks "Sign in with Google"
           ↓
    Frontend initiates Google Sign-In
           ↓
    Google popup/redirect
           ↓
    User authenticates with Google
           ↓
    Google returns ID token (implicit) or code (server-side)
           ↓
    Frontend sends token/code to backend
           ↓
    GoogleAuthController.login() or .callback()
           ↓
    GoogleAuthService.authenticateWithGoogle()
           ├─ Verify Google ID token
           │  └─ OAuth2Client.verifyIdToken()
           │     ├─ Validate signature
           │     ├─ Validate audience
           │     ├─ Validate expiration
           │     └─ Extract payload (sub, email, name)
           ├─ Check if user exists
           │  ├─ By googleId (existing OAuth user)
           │  ├─ By email (account linking)
           │  └─ Create if doesn't exist
           ├─ Generate JWT tokens
           ├─ Store hashed refresh token
           └─ Return tokens & user
           ↓
    setAuthCookies()
           ↓
    Frontend redirected to dashboard
           ↓
    User authenticated ✓
```

---

## Authentication Flows

### Implicit Flow (Recommended for SPAs)

```
┌──────────┐                                    ┌──────────┐
│ Browser  │                                    │ Backend  │
│          │                                    │          │
│ 1. User clicks                                │          │
│    "Sign in with Google"                     │          │
│            │                                   │          │
│ 2. Google popup appears                       │          │
│    (managed by @react-oauth/google)          │          │
│            │                                   │          │
│ 3. User logs in with Google                   │          │
│            │                                   │          │
│ 4. Google returns ID token directly           │          │
│    to frontend (not going through backend)   │          │
│            │                                   │          │
│ 5. Frontend sends ID token                    │          │
│    POST /auth/google/login                   │          │
│    body: { token: "eyJ..." }────────────────────>1. Verify token
│            │                                   │   - Check signature
│            │                                   │   - Check expiry
│            │                                   │   - Validate audience
│            │                                   │
│            │                         2. Create/find user
│            │                            UPDATE users
│            │                            INSERT refreshTokens
│            │                            Generate JWT
│            │                                   │
│            │<──────────── HTTP 200 ──────────┤ 3. Set cookies
│            │   Set-Cookie: access_token      │   Set-Cookie: refresh_token
│            │                                   │
│ 6. Frontend stores cookies automatically     │          │
│    (HTTP-only cookies handled by browser)   │          │
│            │                                   │          │
│ 7. Frontend redirects to dashboard           │          │
│            │                                   │          │
│ 8. Subsequent requests include cookies      │          │
│    GET /api/protected                       │          │
│    Cookie: access_token=...──────────────────>1. Verify JWT
│            │                                   │
│            │<──────── Protected data ─────────┤ 2. Return resource
│            │                                   │          │
└──────────┘                                    └──────────┘
```

### Authorization Code Flow (Server-Side)

```
┌──────────┐                    ┌──────────┐                ┌────────┐
│ Browser  │                    │ Backend  │                │ Google │
│          │                    │          │                │        │
│ 1. User clicks                │          │                │        │
│    "Sign in with Google"      │          │                │        │
│            │                  │          │                │        │
│ 2. GET /auth/google/auth-url  │          │                │        │
│    ─────────────────────────────>1. Generate URL          │        │
│            │                  │   - client_id             │        │
│            │                  │   - redirect_uri          │        │
│            │                  │   - scope                 │        │
│            │                  │   - state (CSRF)          │        │
│    Auth URL                   │                           │        │
│    <────────────────────────────2. Return URL              │        │
│            │                  │                           │        │
│ 3. Redirect browser           │                           │        │
│    https://accounts.google.com/...                        │        │
│            ├─────────────────────────────────────────────>Google   │
│            │                                               │        │
│ 4. User logs in with Google   │                           │        │
│            │                  │                           │        │
│ 5. Google redirects           │                           │        │
│    http://localhost:3000/...?code=...                     │        │
│    <─────────────────────────────────────────────────────┤        │
│            │                  │                           │        │
│ 6. Frontend gets code         │                           │        │
│    POST /auth/google/callback │                           │        │
│    body: { code: "..." }──────────>1. Exchange code       │        │
│            │                  │    POST to Google         │        │
│            │                  │    code + client_secret   │        │
│            │                  │    ──────────────────────────────>│
│            │                  │                           │        │
│            │                  │    Google returns         │        │
│            │                  │    access_token, id_token│        │
│            │                  │    <─────────────────────────────┤
│            │                  │                           │        │
│            │                  │    2. Verify id_token     │        │
│            │                  │    3. Create/find user    │        │
│            │                  │    4. Generate JWT        │        │
│            │                  │                           │        │
│    HTTP 200 with cookies      │                           │        │
│    <─────────────────────────────── 5. Set-Cookie        │        │
│            │                  │                           │        │
│ 7. Frontend redirects         │                           │        │
│    to dashboard               │                           │        │
│            │                  │                           │        │
└──────────┘                    └──────────┘                └────────┘
```

---

## Security Architecture

### Token Management

```
Token Generation & Storage
├── Access Token (JWT)
│   ├── Payload: { userId, iat, exp }
│   ├── Secret: JWT_ACCESS_SECRET
│   ├── Expiry: 15 minutes
│   ├── Storage: HTTP-only cookie (auto-sent)
│   └── Usage: Verify request authentication
│
└── Refresh Token (JWT)
    ├── Payload: { userId, iat, exp }
    ├── Secret: JWT_REFRESH_SECRET
    ├── Expiry: 30 days
    ├── Database Storage: bcryptjs hash
    ├── Cookie Storage: HTTP-only (auto-sent)
    └── Usage: Get new access token pair
```

### Token Rotation (Refresh Flow)

```
Old Refresh Token (valid)
           ↓
    1. Hash token
    2. Query DB for hash
    3. Check if revoked
    4. Check if expired
           ↓
    If valid:
           ├─ Mark old token as revoked (UPDATE)
           ├─ Generate new access token
           ├─ Generate new refresh token
           ├─ Hash new refresh token
           ├─ Store new hash in DB (INSERT)
           └─ Return new pair
           ↓
    If invalid/expired/revoked:
           └─ Return 401 Unauthorized
           ├─ User must log in again
           └─ Prevents token replay attacks
```

### Security Headers & Protections

```
HTTP Headers
├── CORS
│   ├── Access-Control-Allow-Origin: CLIENT_URL
│   ├── Access-Control-Allow-Credentials: true
│   └── Prevents cross-origin token theft
│
├── Cookie Flags
│   ├── HttpOnly: Prevents JavaScript access
│   ├── Secure: Only sent over HTTPS
│   ├── SameSite: Strict (production) / Lax (dev)
│   └── Prevents CSRF attacks
│
├── Helmet Headers
│   ├── Content-Security-Policy
│   ├── X-Frame-Options: DENY
│   ├── X-Content-Type-Options: nosniff
│   └── Strict-Transport-Security
│
└── Rate Limiting
    ├── Login endpoint: 5 attempts / 15 minutes
    ├── Google OAuth: Rate limited
    └── Refresh: Standard rate limits
```

### Data Security

```
Database Security
├── Password Hashing (bcryptjs)
│   ├── Cost: 10 (default)
│   ├── Salt: Auto-generated per password
│   └── Stored: bcryptjs hash format
│
├── Token Hashing
│   ├── Algorithm: SHA256 (crypto module)
│   ├── Only hash stored in DB
│   ├── Plain token sent to user once
│   └── Prevents database breach token theft
│
└── OAuth User Fields
    ├── googleId: Unique identifier from Google
    ├── provider: Authentication method
    └── passwordHash: NULL for OAuth-only users
```

---

## Data Models

### User Model

```typescript
interface User {
  id: string;                    // UUID primary key
  email: string;                 // Unique email address
  passwordHash: string | null;   // NULL for OAuth users
  fullName?: string;             // User display name
  googleId?: string;             // Unique Google ID
  provider: string;              // 'local' | 'google' | ...
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Refresh Token Model

```typescript
interface RefreshToken {
  id: string;                    // UUID primary key
  userId: string;                // Foreign key to users
  tokenHash: string;             // SHA256 hash of token
  expiresAt: Date;               // Expiration timestamp
  revoked: boolean;              // Revocation flag
  createdAt: Date;               // Creation timestamp
}
```

### JWT Payload Structure

```typescript
// Access Token
interface AccessTokenPayload {
  userId: string;
  iat: number;        // Issued at
  exp: number;        // Expires at (15 min)
}

// Refresh Token
interface RefreshTokenPayload {
  userId: string;
  iat: number;        // Issued at
  exp: number;        // Expires at (30 days)
}

// Google ID Token (received from Google)
interface GoogleIdTokenPayload {
  iss: string;        // "https://accounts.google.com"
  sub: string;        // Google unique ID
  email: string;      // User email
  name: string;       // User display name
  picture: string;    // User avatar URL
  aud: string;        // Audience (client_id)
  exp: number;        // Expiration
  iat: number;        // Issued at
}
```

---

## Extensible Design

### Multi-Provider Architecture

#### Current Structure

```
src/modules/auth/
├── auth.controller.ts    (Local auth only)
├── auth.service.ts       (Local auth only)
├── auth.routes.ts        (Mounts local + oauth routes)
│
└── google/               (OAuth provider module)
    ├── google.service.ts
    ├── google.controller.ts
    ├── google.routes.ts
    └── google.validators.ts
```

#### Future Structure (Extensible)

```
src/modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.routes.ts
│
├── providers/            (NEW - Abstract base classes)
│   ├── oauth.provider.ts (Abstract OAuth provider)
│   ├── oauth.factory.ts  (Factory pattern)
│   └── oauth.types.ts    (Common types)
│
├── google/
│   ├── google.service.ts (extends OAuthProvider)
│   ├── google.controller.ts
│   ├── google.routes.ts
│   └── index.ts
│
├── github/               (NEW - Same pattern)
│   ├── github.service.ts
│   ├── github.controller.ts
│   ├── github.routes.ts
│   └── index.ts
│
├── facebook/             (NEW - Same pattern)
│   ├── facebook.service.ts
│   ├── facebook.controller.ts
│   ├── facebook.routes.ts
│   └── index.ts
│
└── discord/              (NEW - Same pattern)
    ├── discord.service.ts
    ├── discord.controller.ts
    ├── discord.routes.ts
    └── index.ts
```

### Adding New Providers - Pattern

```typescript
// Step 1: Create abstract provider
export abstract class OAuthProvider {
  abstract verifyToken(token: string): Promise<OAuthProfile>;
  abstract getAuthUrl(redirectUri: string): string;
  abstract exchangeCodeForTokens(code: string): Promise<OAuthTokens>;
}

// Step 2: Implement for new provider
export class GitHubOAuthProvider extends OAuthProvider {
  static async verifyToken(token: string) {
    // GitHub-specific verification
  }

  static async getAuthUrl(redirectUri: string) {
    // GitHub OAuth URL
  }

  // ... other methods
}

// Step 3: Register in factory
export const OAuthFactory = {
  create(provider: 'google' | 'github' | 'facebook'): OAuthProvider {
    switch (provider) {
      case 'google':
        return new GoogleOAuthProvider();
      case 'github':
        return new GitHubOAuthProvider();
      // ... etc
    }
  }
};

// Step 4: Reuse authentication flow
static async authenticateWithProvider(
  provider: string,
  token: string
) {
  const oauthProvider = OAuthFactory.create(provider);
  const profile = await oauthProvider.verifyToken(token);
  // Same flow as Google...
}
```

### Database Schema for Multi-Provider

```typescript
export const users = pgTable('users', {
  // ... existing fields

  // OAuth fields (extensible pattern)
  googleId: varchar('google_id', { length: 255 }).unique(),
  githubId: varchar('github_id', { length: 255 }).unique(),
  facebookId: varchar('facebook_id', { length: 255 }).unique(),
  discordId: varchar('discord_id', { length: 255 }).unique(),
  
  // Single provider field to track primary auth method
  provider: varchar('provider', { length: 50 }).notNull().default('local'),
  // 'local' | 'google' | 'github' | 'facebook' | 'discord'
});
```

---

## Performance Considerations

### Query Optimization

```typescript
// Indexed lookups for common queries
db.query.users.findFirst({
  where: eq(users.googleId, googleId),  // Indexed for speed
});

db.query.users.findFirst({
  where: eq(users.email, email),        // Already unique indexed
});

db.query.refreshTokens.findFirst({
  where: eq(refreshTokens.tokenHash, hashed),  // Should be indexed
});
```

### Caching Strategy

```typescript
// Google verification could be cached
const cachedPayload = cache.get(`google-token-${tokenHash}`);

if (cachedPayload) {
  return cachedPayload;
}

const payload = await verifyGoogleToken(token);
cache.set(`google-token-${tokenHash}`, payload, 5 * 60); // 5 min
return payload;
```

---

## Monitoring & Logging

### Events to Log

```typescript
// Authentication events
logger.info('User logged in', { userId, provider: 'google' });
logger.info('User logged in', { userId, provider: 'local' });
logger.info('Token refreshed', { userId });
logger.warn('Failed login attempt', { email, reason: 'invalid credentials' });
logger.error('Google token verification failed', { error });

// Security events
logger.warn('Multiple failed login attempts', { email, attempts: 5 });
logger.warn('Refresh token revoked', { userId, tokenId });
logger.error('Account linking attempted', { userId, email });
```

---

## Summary

The Google OAuth architecture is built on:

1. **Clean Separation of Concerns**: Local auth, Google OAuth, and future providers in separate modules
2. **Security First**: Token rotation, hashing, secure cookies, rate limiting
3. **Type Safety**: TypeScript with strict types throughout
4. **Extensibility**: Easy to add new OAuth providers without modifying existing code
5. **Production Ready**: Comprehensive error handling, validation, and security practices
6. **Maintainability**: Clear structure, comprehensive documentation, tested patterns

The system is designed to scale from local auth to multi-provider OAuth with minimal changes to core logic.
