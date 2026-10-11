# Architecture

## Packages

| Package            | Runtime                           | Responsibility                                   |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| `@caly/webapp`     | Cloudflare Worker (static assets) | Preact SPA, routes, App shell, Agentation        |
| `@caly/api`        | Cloudflare Worker                 | Hono API, services, repositories, middleware     |
| `@caly/ui`         | source-only                       | shadcn (Base UI) primitives, `cn`                |
| `@caly/shared`     | source-only                       | Zod contracts, types, pure utilities             |
| `@caly/worker-kit` | source-only                       | CORS factory, response envelope, request context |

`@caly/ui`, `@caly/shared`, and `@caly/worker-kit` are consumed as TypeScript
source (their `exports` point at `src/**`). Vite and Wrangler compile them
together with their consumers, so they need no build step.

## Dependency direction

```text
webapp ──▶ ui ──▶ shared
   │        │
   ├────▶ shared
   └────▶ worker-kit ◀── api ──▶ shared
```

- `webapp` may import `ui`, `shared`, `worker-kit`.
- `api` may import `shared`, `worker-kit`.
- `api` must not import `webapp`; `webapp` must not import `api`.
- `ui`/`shared`/`worker-kit` must not import application packages.

## Request flow (production)

The SPA is served same-zone with the API. A Cloudflare route binds `/api/*` to
the API Worker; everything else is served by the web Worker with SPA fallback.

```text
browser ──▶ app.example.com/            ──▶ web Worker (assets, SPA fallback)
browser ──▶ app.example.com/api/v1/...  ──▶ api Worker (Hono)
```

In development the SPA calls `http://localhost:8787/api/v1` directly.
