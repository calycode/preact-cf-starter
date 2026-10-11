# Caly Cloud — Agent Guide

## Architecture

- `packages/webapp` is the Preact SPA and frontend Worker.
- `packages/api` is the backend Hono API Worker (starts with no bindings).
- `packages/ui` contains reusable shadcn (Base UI) primitives.
- `packages/shared` contains API contracts, schemas, types, and domain utilities.
- `packages/worker-kit` contains binding-agnostic Worker utilities.

## Routing

- Use `preact-iso` for frontend routing. There is **no `Link` export** — use
  plain `<a href>` elements; preact-iso intercepts them. For programmatic
  navigation use `useLocation().route(path)`.
- Do not add React Router.
- Route files are plain module names declared explicitly in `App.tsx`
  (no Next-style `[id].tsx`).
- Use Hono route modules for API routing.

## Preact rules

- React imports resolve to `preact/compat` via BOTH Vite (`vite.config.ts`) and
  TypeScript (`tsconfig.json` paths). Both layers are mandatory; keep them in
  sync.
- Never import from `preact/hooks` directly; import from `'react'`.
- Do not add `react` or `react-dom` as runtime dependencies.
- Keep `process.env.IS_PREACT` defined and the Preact preset's built-in React
  aliases disabled (see `packages/webapp/vite.config.ts`).

## shadcn rules

- Run shadcn from `packages/webapp`.
- Generated primitives land in `packages/ui/src/components`.
- Never create `packages/webapp/src/components/ui`.
- Import primitives as `@caly/ui/components/*`.
- Keep `components.json` design settings aligned between webapp and UI.
- Base UI is unofficial under Preact; smoke-test Dialog / DropdownMenu / Select
  / Popover in the running app after adding components.

## API rules

- Validate all external input with Zod schemas from `packages/shared`.
- Keep route handlers thin; use services for business logic and repositories
  for data access.
- Use the shared response envelope from `@caly/worker-kit`.
- Start with no bindings; add D1/R2/KV (and extend `ApiEnv`) only when a feature
  requires them.
- Do not import `packages/webapp` from `packages/api`.

## Remote cache

- Turborepo remote cache is opt-in. Never make tasks fail when `TURBO_TOKEN` /
  `TURBO_TEAM` are unset.

## UI feedback

- Use Agentation during UI development (development only).
- Read pending annotations before implementing UI changes.
- Resolve annotations only after verifying the implemented change.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
