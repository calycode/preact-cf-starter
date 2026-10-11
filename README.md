# Caly Cloud Starter

A lightweight, agent-friendly starter monorepo for building **Cloudflare
Worker-hosted Preact** applications with a real backend path.

- **Webapp** — Preact + Vite SPA on Cloudflare Workers, routed with `preact-iso`.
- **API** — a separate [Hono](https://hono.dev) Worker.
- **Shared UI** — shadcn/ui (Base UI) primitives generated into `packages/ui`.
- **Contracts** — Zod schemas in `packages/shared`, shared by client and API.
- **Agentation** — click-to-annotate UI feedback for coding agents, dev-only.
- **Turborepo** — task graph with opt-in remote caching.

See [`SPEC.md`](./SPEC.md) for the full design and the decision log.

## Requirements

- Node 22+
- pnpm 10+
- A Cloudflare account (only to deploy)

## Quick start

```bash
pnpm install
pnpm dev            # webapp on :5173, API on :8787
```

Other scripts:

```bash
pnpm build          # build webapp + api
pnpm lint           # eslint
pnpm check-types    # tsc
pnpm test           # vitest
pnpm knip           # dead-code / dependency hygiene
pnpm deploy         # deploy api, then web
```

## Layout

```text
packages/
├── webapp     Preact SPA + frontend Worker
├── api        Hono API Worker
├── ui         shared shadcn (Base UI) primitives
├── shared     Zod contracts, types, utilities
└── worker-kit binding-agnostic Worker helpers
```

## Conventions

Read [`AGENTS.md`](./AGENTS.md) before making changes. The most important rules:

- React imports resolve to `preact/compat` via **both** Vite and `tsconfig`.
- Never add `react` / `react-dom` as runtime dependencies.
- Generate shadcn components into `packages/ui`, never into the webapp.
- `preact-iso` has **no `Link` export** — use plain `<a>` elements.
