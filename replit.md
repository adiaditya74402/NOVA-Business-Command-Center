# NOVA — Smart Business Command Center

NOVA is a responsive business intelligence dashboard for monitoring revenue, campaigns, customers, reports, and planning workflows.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nova-command-center/src/App.tsx` — dashboard shell, page sections, charts, campaign builder, and interactive states
- `artifacts/nova-command-center/src/index.css` — NOVA theme tokens and responsive utility styles
- `artifacts/nova-command-center/.replit-artifact/artifact.toml` — web artifact routing and managed workflow

## Architecture decisions

- The dashboard is frontend-only and uses the repository's realistic sample data for its first build.
- Navigation is implemented as in-page dashboard views so the full command center remains fast and usable in a single workspace.
- The artifact is served at `/` to keep the primary app available from the project root.

## Product

- Overview dashboard with revenue, customer, conversion, and campaign KPIs
- Campaign performance filtering, sorting, deletion confirmation, and campaign builder flow
- Analytics, customer insights, reports, tasks, settings, notifications, profile actions, theme switching, and responsive navigation

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
