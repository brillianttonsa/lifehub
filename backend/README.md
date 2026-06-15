# LifeHub Backend

Backend API for LifeHub - A personal finance and life management application built with Node.js, Express, TypeScript, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Middleware](#middleware)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**
  - Local signup/login with email and password
  - Google OAuth integration
  - JWT-based token management (access & refresh tokens)
  - Password reset functionality
  - Secure cookie-based session management

- **Pocket Module** (Finance Management)
  - Wallet management (Cash, Bank, Mobile Money)
  - Activity categorization for transactions
  - Transaction tracking (Income, Expense, Transfer)
  - Financial overview and statistics
  - Soft delete support for data recovery

- **Security & Performance**
  - Rate limiting on authentication and API endpoints
  - Helmet.js for HTTP headers security
  - CORS configuration
  - Request/Response logging and monitoring
  - Error handling and validation middleware

- **Code Quality**
  - TypeScript for type safety
  - ESLint for code linting
  - Prettier for code formatting
  - Vitest for unit testing

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20+ |
| **Language** | TypeScript |
| **Framework** | Express.js 5.x |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM |
| **Validation** | Zod |
| **Authentication** | JWT, bcryptjs |
| **Security** | Helmet.js, express-rate-limit |
| **Testing** | Vitest |
| **Code Quality** | ESLint, Prettier |

## 📋 Prerequisites

Before running the backend, ensure you have:

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** 16 (local or remote)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/brillianttonsa/lifehub.git
cd lifehub/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name lifehub-db \
  -e POSTGRES_DB=lifehub \
  -e POSTGRES_USER=lifehub_user \
  -e POSTGRES_PASSWORD=lifehub_password \
  -p 5432:5432 \
  -d postgres:16
```

#### Manual PostgreSQL Setup

Create a database and user:

```sql
CREATE DATABASE lifehub;
CREATE USER lifehub_user WITH PASSWORD 'lifehub_password';
GRANT ALL PRIVILEGES ON DATABASE lifehub TO lifehub_user;
```

## 🔧 Environment Setup

### Create `.env` File

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://lifehub_user:lifehub_password@localhost:5432/lifehub

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Generate JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Migrations

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio (visual database editor)
npm run db:studio
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{ "status": "OK" }
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   └── env.ts             # Environment variables
│   ├── db/
│   │   ├── index.ts           # Database connection
│   │   └── schema/            # Drizzle ORM schemas
│   │       ├── auth/          # Auth tables (users, tokens)
│   │       └── pocket/        # Finance tables (wallets, transactions, activities)
│   ├── middlewares/
│   │   ├── auth.middleware.ts         # JWT authentication
│   │   ├── error.middleware.ts        # Error handling
│   │   ├── validate.middleware.ts     # Zod validation
│   │   ├── rateLimit.middleware.ts    # Rate limiting
│   │   └── logger.middleware.ts       # Logging & monitoring
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── google/        # Google OAuth
│   │   └── pocket/            # Finance management module
│   │       ├── activities/    # Transaction categories
│   │       ├── wallets/       # Wallet management
│   │       ├── transactions/  # Transaction management
│   │       └── pocket/        # Overview & statistics
│   └── utils/
│       ├── AppError.ts        # Custom error class
│       ├── asyncHandler.ts    # Async wrapper
│       ├── jwt.ts             # JWT utilities
│       ├── hash.ts            # Password hashing
│       └── cookies.ts         # Cookie utilities
├── drizzle/                   # Database migration files
├── dist/                      # Compiled JavaScript (after build)
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── eslint.config.mjs          # ESLint configuration
└── drizzle.config.ts          # Drizzle ORM configuration
```

## 📚 API Documentation

### Authentication Routes

Base: `/api/auth`

- `POST /signup` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /me` - Get current user info
- `POST /google/callback` - Google OAuth callback

### Pocket (Finance) Routes

Base: `/api/pocket`

#### Activities
- `POST /activities` - Create activity
- `GET /activities` - List user activities
- `DELETE /activities/:id` - Delete activity
- `PATCH /activities/:id/restore` - Restore deleted activity

#### Wallets
- `POST /wallets` - Create wallet
- `GET /wallets` - List user wallets
- `GET /wallets/:id` - Get wallet details
- `PATCH /wallets/:id` - Update wallet
- `DELETE /wallets/:id` - Delete wallet

#### Transactions
- `POST /transactions` - Create transaction
- `GET /transactions` - List transactions
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

#### Overview
- `GET /pocket/overview` - Get financial overview

For detailed route documentation, see [POCKET_ROUTES_DOCUMENTATION.md](./src/modules/pocket/POCKET_ROUTES_DOCUMENTATION.md)

## 🗄 Database

### Schema Overview

#### Auth Module
- **users** - User accounts with email, password, profile info
- **refreshTokens** - Refresh token storage for logout
- **passwordResetTokens** - Password reset token storage

#### Pocket Module
- **activities** - Transaction categories (Food, Salary, etc.)
- **wallets** - User's financial accounts (Cash, Bank, Mobile Money)
- **transactions** - Financial movements (Income, Expense, Transfer)

### ER Diagram

```
users (1) ──┬─→ (N) activities
            ├─→ (N) wallets
            └─→ (N) transactions

activities (1) ──→ (N) transactions
wallets (1) ──┬─→ (N) transactions (source)
              └─→ (N) transactions (destination)
```

### Soft Delete Pattern

Activities and Wallets use soft deletes:
- `isDeleted` flag marks records as deleted
- `deletedAt` timestamp records deletion time
- Data remains in database for recovery
- Restore endpoint available for recovery

## 🔐 Middleware

### 1. **Authentication (`authMiddleware`)**
- Validates JWT tokens from cookies
- Sets `userId` on request object
- Returns 401 for missing/invalid tokens

### 2. **Rate Limiting**
- **Global**: 100 requests/15 minutes per IP
- **Strict** (Auth): 5 requests/15 minutes per IP
- **Moderate** (API): 30 requests/15 minutes per IP
- Disabled in development mode

### 3. **Logging (`loggerMiddleware`)**
- Tracks request/response metrics
- Records response time, status, user info
- Structured logging in production
- Human-readable format in development

### 4. **Monitoring (`monitoringMiddleware`)**
- Tracks request/response sizes
- Alerts on slow requests (> 1000ms)
- Records performance metrics

### 5. **Error Handling (`errorHandler`)**
- Catches all errors
- Returns standardized error responses
- Logs errors for debugging

### 6. **Validation (`validate`)**
- Uses Zod for schema validation
- Validates request body/params/query
- Returns 400 with validation errors

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Single Run

```bash
npm run test:run
```

### Test Coverage

Tests are located in `src/modules/*/`. Each module should have:
- `.test.ts` file with unit tests
- Examples: `auth.test.ts`, `google.test.ts`

## 👨‍💻 Development

### Code Style

#### Linting

```bash
# Check for lint errors
npm run lint

# Fix lint errors
npm run lint:fix
```

#### Formatting

```bash
# Format all files
npm run format
```

#### TypeScript

```bash
# Check types
npx tsc --noEmit
```

### Common Development Tasks

#### Add New Route

1. Create controller in `src/modules/feature/feature.controller.ts`
2. Create service in `src/modules/feature/feature.service.ts`
3. Create routes in `src/modules/feature/feature.routes.ts`
4. Create validation schema in `src/modules/feature/feature.schema.ts`
5. Import routes in module's `index.ts`
6. Add to main app in `src/app.ts`

#### Add Database Table

1. Create schema file in `src/db/schema/feature/table.ts`
2. Export in `src/db/schema/feature/index.ts`
3. Run `npm run db:generate` to create migration
4. Review and run `npm run db:push`

#### Add Validation Schema

Use Zod for runtime validation:

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:password@host:5432/lifehub
JWT_ACCESS_SECRET=production_secret_access
JWT_REFRESH_SECRET=production_secret_refresh
CLIENT_URL=https://yourdomain.com
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/src/server.js"]
```

### CI/CD Pipeline

GitHub Actions workflows are configured in `.github/workflows/`:

- **backend.yml** - Lint, test, build for backend changes
- **frontend.yml** - Lint, build for frontend changes
- **quality.yml** - Security audit and dependency checks

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting: `npm run test:run && npm run lint`
4. Create a pull request
5. Await CI/CD pipeline completion
6. Get code review approval
7. Merge to `develop` or `main`

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Related Documentation

- [Pocket Module Routes](./src/modules/pocket/POCKET_ROUTES_DOCUMENTATION.md)
- [Authentication Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)
- [Google OAuth Setup](./src/modules/auth/google/GOOGLE_OAUTH_README.md)

## 🆘 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### JWT Secret Error

```
Error: Missing env variable: JWT_ACCESS_SECRET
```

**Solution**: Generate and add JWT secrets to `.env` file

### Rate Limit Blocked

**Solution**: In development, rate limiting is disabled. In production, adjust limits in `rateLimit.middleware.ts`

### TypeScript Errors

```bash
# Rebuild type definitions
npm run build
```

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a detailed bug report
3. Include error logs and reproduction steps

---

**Last Updated**: 2026-05-22 | **Version**: 1.0.0
