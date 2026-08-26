# AGENTS.md

## Overview

Trimly is a URL shortener: `client` (Next.js 16 App Router + Tailwind v4 + shadcn/ui, dark theme), `server` (Express 5 API, entry `server.ts` + `src/app.ts`), `worker` (BullMQ analytics consumer, entry `worker/index.ts`), and shared libs in `packages/*` (`@packages/config|logging|queue|db`). pnpm workspace (pnpm 10); server/worker/packages are ESM/NodeNext, client is standard Next.js TS.

## Structure

```
client/                     # Next.js 16 App Router UI (dev on :3001 — API owns :5000)
  app/
    page.tsx                # landing page (dark SaaS)
    layout.tsx              # fonts, AuthProvider, Toaster, <html class="dark">
    login/, signup/         # auth pages (react-hook-form + zod)
    (dashboard)/            # auth-guarded shell: sidebar + avatar menu
      dashboard/page.tsx        # stats cards + URL table + create/edit/delete
      dashboard/[shortCode]/    # per-link analytics (recharts via shadcn chart)
      settings/                 # profile, logout, delete account
  components/{ui,landing,auth,dashboard}/   # ui/* is shadcn (do not hand-edit lightly)
  lib/
    api.ts                  # axios instance; Bearer header + single-flight refresh on 401
    auth-context.tsx        # useAuth(): user state, login/register/logout/deleteAccount
    types.ts                # API shapes (camelCase responses)
  .env.local                # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
server/                     # Express 5 API
  server.ts                 # process entrypoint: connects Prisma + Redis, then listens
  src/
    app.ts                  # express app wiring
    config/                 # wraps @packages/config getServerConfig()
    routes/                 # user.route.ts, url.route.ts (mounted in app.ts)
    controllers/            # request handlers per route file
    middlewares/            # auth, validation, errorHandler
    validations/            # zod schemas used by validation middleware
    services/               # redis client, bullmq enqueue, winston, sentry
    utils/                  # jwt, password, short-code helpers
    db/index.ts             # prisma singleton via createPrisma(DATABASE_URL)
worker/                     # BullMQ analytics consumer
  index.ts                  # real entrypoint (see dev-script gotcha below)
  src/
    worker.ts               # createAnalyticsWorker() wiring from @packages/queue
    config.ts, db/db.ts, services/
packages/
  config/                   # zod env parsing: getServerConfig/getWorkerConfig/getDatabaseConfig
  logging/                  # winston: createLogger
  queue/                    # bullmq + ioredis: getAnalyticsQueue, createRedisClient, redisKeys
  db/                       # Prisma 7: schema.prisma, migrations/, generated/prisma/, exports createPrisma
```

## Commands

Run from repo root unless noted.

- **Build once after clone and whenever `packages/*` change:** `pnpm build`. Workspace packages are consumed via their compiled `dist/` output (no tsconfig path aliases), so app `dev`, `typecheck`, and even Prisma CLI commands fail until `packages/*` are built. Root `build` handles dependency order automatically.
- Local infra (Postgres 17 :5432, Redis :6379 password `trimly-redis@2429`, Adminer :8080): `docker compose -f server/docker-compose.yml up -d`
- Env: copy `server/.env.example` to `server/.env`; `worker/.env` is loaded similarly. Each app loads `.env` from its own directory via `dotenv/config`.
- All apps dev: `pnpm dev` (parallel). Gotcha: worker's `dev` script points at nonexistent `src/index.ts`; its real entry is `worker/index.ts`. Run it manually instead: `pnpm --dir worker exec tsx watch index.ts`
- Verify changes: `pnpm typecheck && pnpm lint` then `pnpm build`. There is **no test suite or framework** in this repo — don't search for one or invent test commands. Note: root `typecheck` skips `client` (no typecheck script); client typing is gated by its build (`next build`).
- Prisma lives in `packages/db` (Prisma 7, configured via `prisma.config.ts`, schema at `prisma/schema.prisma`):
  - Regenerate client: `pnpm --dir packages/db run db:generate` — output `generated/prisma` is gitignored, so this is required after clone or any schema change
  - Local migration: `pnpm --dir packages/db run db:migrate` (prod deploy uses `migrate deploy`, see root compose)
- Root `docker-compose.yml` is the **production** stack (prebuilt images, `.env.production` files, a `migrate` job, API on :5000) — not for local development.

## Conventions

- Relative imports inside server/worker/packages TS source end in `.js` (NodeNext + `verbatimModuleSyntax`), e.g. `import "./src/app.js"`. The Next.js client does NOT do this — plain extensionless imports with `@/*` aliases.
- tsconfig is strict-plus: `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are enabled — write code accordingly. Client uses its own strict tsconfig from create-next-app.
- Shared logic belongs in `packages/*`; apps import only its exports (`getServerConfig`, `createPrisma`, `getAnalyticsQueue`, `createLogger`, ...). Each app creates its own Prisma instance via `createPrisma(DATABASE_URL)`; the generated client never leaves `packages/db`.
- Pre-commit (husky + lint-staged) runs Prettier (double quotes, semicolons, trailing commas) on staged files only.
- ESLint ignores `**/generated/**`; don't hand-edit generated Prisma files.
