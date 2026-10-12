# Caly Cloud — Context

Caly Cloud is a lightweight Cloudflare Worker-hosted Preact application for
internal tools, reusable UI, and agent-assisted product experiments.

## Current spike

- Preact webapp deployed to Cloudflare Workers.
- Preact-native routing with `preact-iso`.
- React-to-Preact compatibility for shadcn (Base UI) and React libraries.
- Shared UI package for generated shadcn primitives.
- Separate Hono API Worker, typed environment, no bindings yet.
- Optional Frostbase backend preset for auth, data, storage, realtime, and
  remote configuration.
- Theme/preset switching via the shadcn CLI.
- Agentation visual feedback for coding agents.
- Turborepo with opt-in remote caching and CI quality gates.

## Constraints

- Keep the starter lightweight.
- Avoid premature infrastructure decisions.
- Preserve Preact as the only UI runtime.
- Keep generated UI primitives separate from application code.
- Keep API contracts in `packages/shared`.
- Keep Frostbase optional and isolated behind repository adapters.

## Notes on this scaffold

- The shadcn style is `base-mira` (Base UI). `base-nova` is the same Base UI
  family; `base-mira` is used because the initial primitives were ported
  verbatim from the proven reference configuration.
- `packages/worker-kit` exists because `@caly/api` consumes its CORS factory,
  response-envelope helpers, and request-context middleware. Fold it back into
  `@caly/api` if it ever has fewer than two real consumers.
