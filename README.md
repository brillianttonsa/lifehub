# Lifehub

Monorepo containing the Lifehub application: a NestJS backend and a React + Vite frontend.

Repository layout

- `backend-lifehub/` — NestJS backend (API, database migrations, Drizzle)
- `frontend/` — React + Vite frontend client

Prerequisites

- Node 18+ (LTS)
- pnpm (preferred package manager)
- PostgreSQL (for running the backend locally)

Quick start

1. Backend

```bash
cd backend-lifehub
pnpm install
pnpm run start:dev
```

2. Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

CI

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that installs dependencies and runs build/test for both backend and frontend on push and pull_request.

Where to look next

- Backend docs: [backend-lifehub/README.md](backend-lifehub/README.md)
- Frontend docs: [frontend/README.md](frontend/README.md)
