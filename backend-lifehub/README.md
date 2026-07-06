# Backend — Lifehub (NestJS)

This folder contains the NestJS backend API for Lifehub. It provides authentication, project/plan/discipline management, and persistence via PostgreSQL (Drizzle ORM).

Tech stack

- Node.js + NestJS
- TypeScript
- Drizzle ORM + SQL migrations (see `drizzle/`)
- pnpm as package manager

Setup

1. Copy environment variables or create `.env` according to `src/config/env.ts`.
2. Install dependencies:

```bash
cd backend-lifehub
pnpm install
```

3. Run the development server:

```bash
pnpm run start:dev
```

Database

- Migrations and SQL snapshots live under `drizzle/`.
- Ensure PostgreSQL is running and `DATABASE_URL` (or equivalent) is set before running migrations or starting the app.

Common scripts (from `package.json`)

- `pnpm run start:dev` — Start NestJS in watch mode for local development
- `pnpm run build` — Compile TypeScript to `dist/`
- `pnpm run start:prod` — Run the production build
- `pnpm run test` — Run tests (if configured)

Notes

- See `src/config/env.ts` for environment variable expectations.
- Use Drizzle snapshots in `drizzle/meta` for DB state and `drizzle/*` for SQL migration files.
