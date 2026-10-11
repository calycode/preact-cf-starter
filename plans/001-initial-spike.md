# Plan 001 — Initial spike

Goal: a working tracer-bullet monorepo that proves the risky parts end-to-end
before breadth is added. See `SPEC.md` §22.

## Steps

1. pnpm workspace + Turborepo.
2. Root TypeScript / ESLint / Prettier / Knip / Husky / Vitest config.
3. `@caly/webapp`: Vite + Preact + Tailwind v4 + Cloudflare Vite plugin, with
   the D2 aliasing applied verbatim.
4. `preact-iso` route shell (plain anchors — no `Link`).
5. `@caly/ui`: shadcn monorepo aliases; `button`, `card`, `dialog`.
6. **D3 compatibility gate**: Dialog / DropdownMenu / Select / Popover.
7. Theme tokens + `globals.css` + `ThemeSwitcher`.
8. `@caly/api`: Hono, health route, minimal `ApiEnv`, error handling, shared
   envelope from `worker-kit`.
9. `@caly/shared` Zod contracts + typed frontend API client.
10.   Agentation (dev-only) + MCP registration.
11.   Production `/api/*` same-zone route (D4).
12.   Turborepo remote cache as opt-in (D5) + CI.
13.   Deploy API Worker, then frontend Worker.

## Done when

`pnpm dev` runs both Workers; `pnpm build` produces Worker-compatible output;
`pnpm lint && pnpm check-types && pnpm test && pnpm build && pnpm knip` pass.
