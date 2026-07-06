# Frontend — Lifehub (React + Vite)

This folder contains the React frontend for Lifehub, built with Vite and TypeScript.

Tech stack

- React + TypeScript
- Vite
- pnpm

Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

Available scripts

- `pnpm run dev` — Start the dev server (Vite)
- `pnpm run build` — Create a production build
- `pnpm run preview` — Preview a production build locally

Configuration

- API clients are in `src/api/` — update the base URL if your backend runs on a different host/port.
- Theme and auth context live in `src/context/`.

Testing & linting

- See `package.json` for configured test, lint, and format scripts.
