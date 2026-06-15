# Google OAuth Authentication System

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup & Configuration](#setup--configuration)
3. [Frontend Integration](#frontend-integration)
4. [Backend API Reference](#backend-api-reference)
5. [Security Best Practices](#security-best-practices)
6. [Testing](#testing)
7. [Extensibility for Other Providers](#extensibility-for-other-providers)

---

## Architecture Overview

### System Flow Diagram

```
Frontend                           Backend                          Google
  |                                 |                                |
  |--1. Get Auth URL ------------->|                                |
  |                          2. Generate Google Auth URL            |
  |<--Auth URL (with params)--------|                                |
  |                                 |                                |
  |--3. Redirect User to Google ----|----4. User Authenticates------>|
  |                                 |                                |
  |<--5. Google Redirects with Code--------------------------------------|
  |                                 |                                |
  |--6. Send Code to Backend------->|                                |
  |                          7. Exchange Code for ID Token           |
  |                                 |--8. Token Exchange Request----->|
  |                                 |<--ID Token---------------------|
  |                          9. Verify ID Token                      |
  |                          10. Create/Update User                  |
  |                          11. Generate JWT Access + Refresh      |
  |                          12. Hash & Store Refresh Token         |
  |<--13. JWT Tokens (in cookies)--|                                |
  |                                 |                                |
  | (Authenticated Requests)        |                                |
  |--14. API Request + JWT--------->|                                |
  |<--15. Protected Resource--------|                                |
```

### Database Schema Changes

```sql
-- Updated users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,                    -- NULL for OAuth users
  full_name VARCHAR(150),
  google_id VARCHAR(255) UNIQUE,         -- Google sub claim
  provider VARCHAR(50) NOT NULL DEFAULT 'local',  -- 'local' | 'google' | 'github' | etc
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Components

1. **GoogleAuthService** (`google.service.ts`)
   - Token verification
   - User authentication
   - Token generation
   - OAuth URL generation

2. **GoogleAuthController** (`google.controller.ts`)
   - HTTP request handling
   - Request validation
   - Response formatting

3. **GoogleAuthRoutes** (`google.routes.ts`)
   - Route definitions
   - Route mounting

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install google-auth-library
```

### 2. Environment Variables

Create or update your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Existing JWT Configuration
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Application URLs
CLIENT_URL=http://localhost:3000
```

### 3. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env`

### 4. Run Database Migration

```bash
npm run db:generate
npm run db:push
```

---

## Frontend Integration

### Using React + Google Sign-In

#### 1. Install React Google Sign-In Library

```bash
npm install @react-oauth/google
```

#### 2. Setup Google Provider

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        {/* Your routes */}
      </Router>
    </GoogleOAuthProvider>
  );
}
```

#### 3. Login Component

```jsx
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function GoogleLoginButton() {
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Send the ID token to your backend
        const response = await axios.post(
          'http://localhost:5000/api/auth/google/login',
          { token: codeResponse.credential },
          { withCredentials: true } // Important for cookies
        );

        console.log('Login successful:', response.data);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: () => console.error('Login failed'),
    flow: 'implicit', // or 'auth-code' for server-side exchange
  });

  return (
    <button onClick={() => login()}>
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
```

#### 4. Alternative: Server-Side Authorization Code Flow

```jsx
function GoogleLoginServerFlow() {
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Send authorization code to backend
        const response = await axios.post(
          'http://localhost:5000/api/auth/google/callback',
          { code: codeResponse.code },
          { withCredentials: true }
        );

        console.log('Login successful:', response.data);
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    flow: 'auth-code',
  });

  return (
    <button onClick={() => login()}>
      Sign in with Google (Server Flow)
    </button>
  );
}
```

#### 5. Protected Routes (React Router)

```jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Make request to protected endpoint
        await axios.get('http://localhost:5000/api/protected', {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;
```

#### 6. Logout

```jsx
function LogoutButton() {
  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Backend API Reference

### Endpoints

#### 1. Get Google Authorization URL

**Endpoint**: `GET /api/auth/google/auth-url`

**Description**: Get the Google authorization URL to redirect users to Google login

**Response**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=..."
}
```

**Frontend Usage**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/google/auth-url');
const { authUrl } = await response.json();
window.location.href = authUrl;
```

---

#### 2. Google Login with ID Token

**Endpoint**: `POST /api/auth/google/login`

**Description**: Authenticate user with Google ID token from implicit flow

**Request Body**:
```json
{
  "token": "google_id_token_from_frontend"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

**Cookies Set**:
- `access_token`: JWT access token (15 minutes expiry)
- `refresh_token`: JWT refresh token (30 days expiry)

**Example**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/google/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ token: googleIdToken })
});
const data = await response.json();
```

---

#### 3. Google OAuth Callback

**Endpoint**: `POST /api/auth/google/callback`

**Description**: Handle authorization code from Google OAuth flow (server-side)

**Request Body**:
```json
{
  "code": "authorization_code_from_google"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

**Cookies Set**:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token

**Example**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/google/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ code: authorizationCode })
});
const data = await response.json();
```

---

#### 4. Refresh Access Token

**Endpoint**: `POST /api/auth/refresh`

**Description**: Get new access token using refresh token (existing endpoint)

**Response**:
```json
{
  "success": true
}
```

**Cookies Updated**:
- New `access_token` (rotated)
- New `refresh_token` (rotated)

**Example**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/refresh', {
  method: 'POST',
  credentials: 'include'
});
```

---

#### 5. Logout

**Endpoint**: `POST /api/auth/logout`

**Description**: Clear authentication cookies

**Response**:
```json
{
  "message": "Logged out"
}
```

**Example**:
```javascript
await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

---

## Security Best Practices

### 1. **Token Verification**

The `google-auth-library` verifies:
- Token signature using Google's public keys
- Token expiration time
- Audience (Client ID)
- Issuer

```typescript
// Automatic verification in GoogleAuthService
const ticket = await client.verifyIdToken({
  idToken: token,
  audience: env.GOOGLE_CLIENT_ID,
});
```

### 2. **Secure Cookies**

```typescript
// In production, cookies are:
// - httpOnly: Cannot be accessed by JavaScript
// - secure: Only sent over HTTPS
// - sameSite: strict (prevents CSRF)
res.cookie('access_token', token, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
});
```

### 3. **Refresh Token Rotation**

Every time refresh token is used:
1. Old token is marked as revoked
2. New token pair is issued
3. Prevents token replay attacks

```typescript
// Rotate on refresh
await db
  .update(refreshTokens)
  .set({ revoked: true })
  .where(eq(refreshTokens.id, tokenRecord.id));

// Issue new pair
const newAccess = signAccessToken(decoded.userId);
const newRefresh = signRefreshToken(decoded.userId);
```

### 4. **Hashed Refresh Tokens**

Refresh tokens are hashed before storage:

```typescript
const hashed = hashToken(refreshToken);
await db.insert(refreshTokens).values({
  userId: user.id,
  tokenHash: hashed, // Stored as hash, not plaintext
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
```

### 5. **Password Not Required for OAuth**

```typescript
// OAuth users can have NULL passwordHash
if (!user.passwordHash) {
  throw new AppError(
    'This account uses OAuth login. Please login with your OAuth provider.',
    400,
  );
}
```

### 6. **CORS Configuration**

```typescript
// In app.ts
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true, // Allow cookies
}));
```

### 7. **Rate Limiting**

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
});

router.post('/google/login', authLimiter, asyncHandler(GoogleAuthController.login));
```

### 8. **Environment Variable Validation**

```typescript
// Validate required OAuth credentials
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not configured');
}
```

### 9. **HTTPS in Production**

- Always use HTTPS for production
- Redirect HTTP to HTTPS
- Set `secure: true` in cookies

### 10. **Account Linking Security**

Current behavior:
- If Google email matches existing local user, link accounts
- User can then login with Google

Alternative approach (more secure):
```typescript
// Require verification before linking
// Send confirmation email to existing user
// User clicks link to confirm account linking
```

---

## Testing

### Unit Tests

Run tests:
```bash
npm run test
npm run test:watch
npm run test:run
```

### E2E Testing with Real Google Credentials

1. Create a test Google account
2. Use real credentials in test environment
3. Verify token exchange works end-to-end

### Manual Testing Checklist

- [ ] Signup with Google (new user)
- [ ] Login with Google (existing user)
- [ ] Account linking (Google to local)
- [ ] Refresh token rotation
- [ ] Token expiration
- [ ] Logout clears cookies
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected
- [ ] CSRF protection works

---

## Extensibility for Other Providers

The current architecture is designed to support additional OAuth providers without rewriting the system.

### Adding GitHub OAuth

1. **Create GitHub service** (`src/modules/auth/github/github.service.ts`):

```typescript
import { Octokit } from '@octokit/rest';

export class GitHubAuthService {
  private static client = new Octokit({
    auth: env.GITHUB_CLIENT_SECRET,
  });

  static async verifyGitHubToken(token: string) {
    const { data } = await this.client.users.getAuthenticated({
      headers: { authorization: `token ${token}` },
    });
    return data;
  }

  static async authenticateWithGitHub(token: string) {
    const profile = await this.verifyGitHubToken(token);
    
    // Same flow as Google: check if user exists, create if not
    let user = await db.query.users.findFirst({
      where: eq(users.githubId, profile.id),
    });

    if (!user) {
      // Create new user or link to existing email
    }

    // Generate JWT tokens (same as Google)
    return { user, accessToken, refreshToken };
  }
}
```

2. **Create GitHub controller and routes**:

```typescript
// src/modules/auth/github/github.controller.ts
// src/modules/auth/github/github.routes.ts
```

3. **Update database schema**:

```sql
ALTER TABLE users ADD COLUMN github_id VARCHAR(255) UNIQUE;
```

4. **Add to auth routes**:

```typescript
router.use('/github', githubAuthRoutes);
```

### Pattern for Multi-Provider Support

```typescript
// Abstract OAuth Service
export abstract class OAuthProvider {
  abstract verifyToken(token: string): Promise<OAuthProfile>;
  abstract authenticateWithProvider(token: string): Promise<AuthResult>;
  abstract getAuthUrl(redirectUri: string): string;
}

// Concrete Implementations
export class GoogleOAuthProvider extends OAuthProvider { /* ... */ }
export class GitHubOAuthProvider extends OAuthProvider { /* ... */ }

// Factory Pattern
export class OAuthFactory {
  static createProvider(provider: 'google' | 'github' | 'facebook'): OAuthProvider {
    switch (provider) {
      case 'google':
        return new GoogleOAuthProvider();
      case 'github':
        return new GitHubOAuthProvider();
      // ... etc
    }
  }
}
```

### Supported Providers (Future Roadmap)

- ✅ Local (email/password)
- ✅ Google OAuth
- 🔜 GitHub OAuth
- 🔜 Facebook OAuth
- 🔜 Discord OAuth
- 🔜 Apple OAuth
- 🔜 LinkedIn OAuth

---

## File Structure

```
src/modules/auth/
├── auth.controller.ts          # Main auth controller
├── auth.service.ts             # Core auth logic
├── auth.routes.ts              # Auth routes (with Google sub-router)
├── auth.test.ts                # Auth tests
├── google/
│   ├── google.service.ts        # Google OAuth service
│   ├── google.controller.ts     # Google OAuth controller
│   ├── google.routes.ts         # Google OAuth routes
│   ├── google.validators.ts     # Zod schemas
│   ├── google.test.ts           # Google OAuth tests
│   └── index.ts                 # Export barrel
├── github/                      # (Future) GitHub OAuth
│   ├── github.service.ts
│   ├── github.controller.ts
│   └── ...
└── providers/                   # (Future) Abstract provider classes
    └── oauth.provider.ts
```

---

## Troubleshooting

### Issue: "Invalid Client ID"

**Solution**: Verify `GOOGLE_CLIENT_ID` matches exactly in:
1. `.env` file
2. Google Cloud Console
3. Frontend React provider initialization

### Issue: "Invalid Redirect URI"

**Solution**: Ensure redirect URI in request matches exactly:
1. Google Cloud Console authorized URIs
2. Backend request
3. Frontend callback URL

### Issue: "Token Expired"

**Solution**: Check system clock is synchronized. Token expiration is time-sensitive.

### Issue: "Cookies Not Being Set"

**Solution**: Ensure:
1. Frontend sends `credentials: 'include'`
2. Backend has CORS configured with `credentials: true`
3. Using HTTPS in production

### Issue: "User Not Found After Linking"

**Solution**: Refresh token is invalidated. Frontend should request new token pair using refresh endpoint.

---

## Summary

This Google OAuth implementation:

✅ Uses official `google-auth-library`
✅ Maintains existing JWT and refresh token rotation
✅ Integrates seamlessly with React frontends
✅ Follows security best practices
✅ Designed for extensibility to other providers
✅ Includes comprehensive tests
✅ Supports account linking
✅ Uses secure HTTP-only cookies

The modular architecture allows adding new OAuth providers by following the same pattern without touching existing code.
