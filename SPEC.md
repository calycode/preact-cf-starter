# Caly Cloud Starter — Technical Specification

> **Status:** revised after a pre-build critique of the original draft and
> updated to include the optional Frostbase backend preset.
> **Supersedes:** the first `SPEC.md` draft. See §2 for the decisions that
> changed and why.

## 1. Overview

Caly Cloud is a lightweight, agent-friendly starter monorepo for building
Cloudflare Worker-hosted **Preact** applications with a real backend path.

It combines:

- A **Preact + Vite** single-page application hosted on Cloudflare Workers
- **Preact-native client-side routing** using `preact-iso`
- **React-to-Preact aliasing**, enabling shadcn and React-oriented libraries
- **shadcn/ui** components (Base UI primitives) generated into a reusable
  shared UI package
- A separate **Hono API Worker** for backend endpoints, domain logic, and
  authorization
- An **optional Frostbase backend preset** providing auth, document/SQL data,
  realtime subscriptions, R2-backed storage, and remote configuration
- **Agentation** for visual UI annotations fed to coding agents through MCP
- **Turborepo** with remote caching (credentials supplied on demand)
- A package architecture adapted from `calycode/ai-workspace`

The starter should be small enough to understand quickly, but structured enough
to grow into production internal tools and product experiments.

### 1.1 Backend philosophy

The starter does **not** reinvent common backend infrastructure.

- **Hono** remains the application API boundary.
- **Frostbase** is an optional provider of reusable backend primitives:
  authentication, document and SQL data, realtime updates, object storage, and
  remote configuration.
- Application code depends on repository interfaces, not directly on Frostbase.
- The base starter remains usable without Frostbase.

This keeps the template lightweight while allowing a project to “build on the
shoulders of giants” when it needs auth, persistence, uploads, realtime, or
feature flags.

### 1.2 Reference project (corrected)

The original draft claimed to be “inspired by `calycode/ai-workspace`”. The real
repository at `calycode/ai-workspace` is **`preact-electron`**: an
**Electron + Preact** monorepo using **plain pnpm workspaces** — it has **no
Turborepo, no Hono, no wrangler, no Cloudflare, and no `@caly/*` scope** (its
packages are bare: `webapp`, `shared`, `ipc-kit`, `worker-kit`).

We still use it as the reference, but only for the parts it actually proves:

- **Preact + shadcn + Base UI + Tailwind v4 wiring**, documented in
  `docs/preact-shadcn-baseui-tailwind.md`. This guide is the source of truth for
  §7 and §9 — the original draft’s naive aliasing was wrong.
- The **toolkit-package pattern** (`shared` contracts, `worker-kit` helpers).
- Prettier / Knip / Husky / pnpm conventions.

We do **not** inherit its Electron, IPC, or no-Turborepo choices.

## 2. Decisions log

These decisions were reached by grilling the original draft. They are binding
for the initial build; revisit only with a new decision record.

### D1 — This is a pre-build critique, then a thin build

The empty target directory means nothing has been built here yet. This document
is a corrected spec; the first deliverable after it is a **tracer-bullet
implementation** (§23), not a big-bang scaffold.

### D2 — Adopt the reference’s proven Preact/shadcn config verbatim

Use the reference’s battle-tested configuration, not the original draft’s
guess:

- Vite: **regex `find` aliases**, absolute replacements via
  `fileURLToPath(import.meta.resolve(...))`, `reactAliasesEnabled: false` on the
  Preact preset, `react/jsx-runtime` and `react/jsx-dev-runtime` mapped, and
  `define: { 'process.env.IS_PREACT': 'true' }`.
- TS: `jsxImportSource: "preact"` + mirrored `paths` for `react`/`react-dom` +
  `skipLibCheck: true`.
- shadcn: a Base UI style, hand-audited generated components.

Rationale: the original alias block (`react: "preact/compat"` as a bare string,
no `react/jsx-runtime` alias, preset aliases left enabled) is a known failure
mode — non-absolute aliases pass through to esbuild and break, and React JSX
runtime resolves to the missing `react` package.

### D3 — Base UI, gated by a compatibility smoke test

Keep shadcn’s **Base UI** primitives (Base UI is the shadcn default since July
2026; the `base-nova`/`base-mira` styles are real). Base UI and shadcn are
**React-only and not officially supported under `preact/compat`**; known
breakage includes `Dialog.Content` hanging under Preact. Therefore:

- **Gate:** before committing to Base UI, smoke-test `Dialog`, `DropdownMenu`,
  `Select`, and `Popover` under `preact/compat` in the running app.
- **Fallback:** if any of them hang or misbehave, switch the affected
  components (or the whole style) to Radix, which—while equally unofficial—is
  more battle-tested under `preact/compat`.

### D4 — Separate API Worker, same-zone route in production

The SPA reaches the API through a **separate Cloudflare Worker**:

- **Dev:** `VITE_API_BASE_URL=http://localhost:8787/api/v1`.
- **Prod:** `VITE_API_BASE_URL=/api/v1`, served from the same Cloudflare zone,
  with an `/api/*` route bound to the API Worker. This route/zone configuration
  is part of the spec, not left implied (the original draft would have 404’d
  because the web Worker’s SPA fallback would swallow `/api/*`).

### D5 — Turborepo with remote cache, credentials on demand

Keep **Turborepo with remote caching** (this is an explicit goal). The remote
cache **URL and API key are supplied per project on demand** — they are not
committed and CI must not fail when they are absent.

- Local/CI read `TURBO_TOKEN` and `TURBO_TEAM` from the environment.
- A custom cache endpoint (if the org runs one) is supplied via `TURBO_API`.
- When these env vars are unset, Turborepo runs **without** remote cache; tasks
  are still cached locally. Remote cache is opt-in, not a hard gate.
- CI injects the values from repository secrets when they exist; the workflow
  must tolerate their absence.

### D6 — Trim unjustified packages; start binding-free

- **Delete `packages/config`.** Fold shared ESLint/TS/Prettier config to the
  repo root; a separate package with no consumers is dead weight.
- **Keep `packages/worker-kit`** only because it has concrete consumers: the
  CORS factory, the error-envelope helpers, and binding-agnostic request
  middleware used by `packages/api` (§16).
- **Start the API with zero bindings.** `wrangler.jsonc` has no D1/R2/KV, and
  `ApiEnv` is just `{ API_VERSION: string }`. Add bindings only when a feature
  needs them.

### D7 — Frostbase is the optional backend preset, not the API framework

Use **Hono** as the stable HTTP API and application boundary. Use **Frostbase**
as an optional infrastructure layer for auth, data, storage, realtime, and
remote configuration.

Frostbase does not replace Hono:

- Hono owns `/api/v1/*`, request validation, response envelopes, services, and
  authorization policies.
- Frostbase provides reusable backend primitives behind repository adapters.
- The webapp may call Frostbase directly only for authentication, realtime
  subscriptions, and storage uploads when explicitly enabled.

Rationale: this preserves the starter’s clean architecture while avoiding
rebuilding common backend capabilities.

### D8 — Frostbase integration is repository-scoped

Frostbase clients must live in `packages/api/src/infrastructure/frostbase/`.
Routes and services depend on repository interfaces, not directly on Frostbase
SDK types.

This keeps the persistence provider replaceable and prevents frontend code from
coupling to Frostbase.

### D9 — Direct client access is limited and explicit

The Preact app may use Frostbase directly only for:

- Authentication flows.
- Realtime subscriptions.
- Storage uploads using signed URLs.

All normal CRUD, sensitive reads, and writes must go through the Hono API.

Rationale: server-side authorization and domain rules remain enforceable.

## 3. Goals

### Primary goals

- Deploy a Preact SPA to Cloudflare Workers.
- Use Preact as the only UI runtime.
- Use Preact-native routing rather than React Router.
- Use shadcn components without placing generated primitives in the webapp.
- Separate frontend, backend API, shared contracts, UI primitives, and Worker
  utilities.
- Support rapid theme and shadcn design-system preset switching.
- Enable Agentation-powered visual feedback for AI coding agents.
- Use Turborepo task graphs and remote caching from the beginning.
- Maintain typechecking, linting, tests, dependency hygiene, and CI.
- Build on proven backend primitives rather than reimplementing auth, database,
  storage, realtime, and feature-flag infrastructure.
- Keep Frostbase optional: the base starter remains usable without it.

### Non-goals

- Do not build a custom visual annotation system; use Agentation.
- Do not add `react` or `react-dom` as runtime dependencies.
- Do not use React Router for client-side routing.
- Do not place product-specific components in the shared UI package.
- Do not place API implementation code in the webapp.
- Do not make premature infrastructure decisions around billing.
- Do not make Frostbase mandatory; the base template starts with Hono only.
- Do not expose Frostbase clients directly from route components or feature
  code.

## 4. Technology choices

| Area                  | Choice                               | Rationale                                                          |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Monorepo              | Turborepo + pnpm                     | Workspace graph, cached tasks, remote cache (D5)                   |
| Web runtime           | Preact                               | Lightweight React-compatible UI runtime                            |
| Build tool            | Vite                                 | Fast development and production builds                             |
| Frontend routing      | `preact-iso`                         | Preact-team router, hooks-based, async-route aware                 |
| Backend framework     | Hono                                 | Lightweight, Web-standard, Worker-native routing and middleware    |
| Backend primitives    | Frostbase (optional preset)          | Auth, document/SQL data, realtime, R2 storage, remote config       |
| Auth                  | Frostbase / Better Auth              | Reusable authentication without building a custom auth service     |
| Data access           | Repository adapters                  | Services remain provider-agnostic; Frostbase is one implementation |
| Hosting               | Cloudflare Workers + static assets   | One platform for frontend and API                                  |
| UI primitives         | shadcn/ui with Base UI (`base-mira`) | Owned, editable components and design tokens (D3)                  |
| Styling               | Tailwind CSS v4 + CSS variables      | CSS-first config, utility-first styling, theme switching           |
| Validation            | Zod                                  | Shared runtime schemas and TypeScript inference                    |
| Testing               | Vitest                               | Fast TypeScript-first testing                                      |
| Visual agent feedback | Agentation + Agentation MCP          | Click-to-annotate UI feedback for coding agents                    |
| Code hygiene          | Knip, ESLint, Prettier, Husky        | Detect dead code and enforce conventions                           |

## 5. Repository structure

```text
caly-cloud/
├── AGENTS.md
├── CONTEXT.md
├── README.md
├── SPEC.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── vitest.config.ts
├── knip.jsonc
├── eslint.config.js            # root flat config (D6: no packages/config)
├── tsconfig.base.json          # root shared TS options (D6)
├── .prettierrc
├── .editorconfig
├── .gitignore
├── .gitattributes            # forces LF for .husky hooks and *.sh
├── .env.example
├── .husky/
├── .vscode/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── architecture.md
│   ├── theming.md
│   ├── agent-feedback.md
│   ├── frostbase.md
│   └── preact-shadcn-baseui-tailwind.md   # distilled from the reference
├── plans/
│   └── 001-initial-spike.md
└── packages/
    ├── webapp/
    ├── api/
    ├── ui/
    ├── shared/
    └── worker-kit/
```

> `packages/config` is intentionally absent (D6).

## 6. Package responsibilities

| Package            | Responsibility                               | Contains                                                                                 |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@caly/webapp`     | Preact SPA, static assets, frontend Worker   | Routes, features, app components, Agentation integration                                 |
| `@caly/api`        | Backend HTTP API and backend integrations    | Hono routes, services, repositories, middleware, Frostbase infrastructure (when enabled) |
| `@caly/ui`         | Reusable design-system primitives            | shadcn-generated components, shared UI hooks, `cn` utility                               |
| `@caly/shared`     | Framework-agnostic contracts and domain code | Zod schemas, types, constants, API contracts, pure utilities                             |
| `@caly/worker-kit` | Reusable Worker utilities                    | CORS factory, error envelope, binding-agnostic middleware (§16)                          |

### Dependency rules

- `@caly/webapp` may import from `@caly/ui`, `@caly/shared`, and
  `@caly/worker-kit`.
- `@caly/api` may import from `@caly/shared` and `@caly/worker-kit`.
- `@caly/api` must not import from `@caly/webapp`.
- `@caly/webapp` must not import from `@caly/api`.
- `@caly/ui` must not import from `@caly/webapp` or `@caly/api`.
- `@caly/shared` must not import from any application package.
- `@caly/worker-kit` must not import from any application package.
- `@caly/api` may import Frostbase SDK/client packages only from its
  `src/infrastructure/frostbase` directory.
- `@caly/webapp` must not import Frostbase server SDKs or repository code.
- `@caly/shared` must not import Frostbase.

## 7. Preact runtime and React aliasing

The webapp uses Preact while preserving React-compatible imports for shadcn and
third-party libraries (Base UI, Agentation, lucide). There are **two
independent resolution systems** that both must be configured:
**Vite** (runtime) and **TypeScript** (type-checking). Missing either layer
breaks the stack (D2).

### Vite configuration

`packages/webapp/vite.config.ts`:

```ts
import { fileURLToPath } from 'node:url';

import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

// Vite aliases must be absolute paths. Non-absolute values ("preact/compat")
// are passed to esbuild's optimizer as relative paths and fail with
// "Cannot read file: <root>/preact/compat".
const preactEntry = (specifier: string) => fileURLToPath(import.meta.resolve(specifier));
const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
   plugins: [
      // The preset's built-in React aliases are non-absolute, so disable them and
      // declare the full absolute set below. Regex matches are ordered so that
      // "react" never prefix-matches "react/jsx-runtime".
      preact({ reactAliasesEnabled: false }),
      tailwindcss(),
      cloudflare(),
   ],
   base: './',
   server: { port: 5173, strictPort: true },
   define: {
      'process.env.IS_PREACT': JSON.stringify('true'),
   },
   resolve: {
      alias: [
         { find: '@', replacement: srcDir },
         { find: /^react$/, replacement: preactEntry('preact/compat') },
         { find: /^react-dom$/, replacement: preactEntry('preact/compat') },
         {
            find: /^react-dom\/client$/,
            replacement: preactEntry('preact/compat/client'),
         },
         {
            find: /^react\/jsx-runtime$/,
            replacement: preactEntry('preact/jsx-runtime'),
         },
         {
            find: /^react\/jsx-dev-runtime$/,
            replacement: preactEntry('preact/jsx-dev-runtime'),
         },
      ],
   },
});
```

### TypeScript configuration

`packages/webapp/tsconfig.json`:

```json
{
   "extends": "../../tsconfig.base.json",
   "compilerOptions": {
      "lib": ["ES2022", "DOM", "DOM.Iterable"],
      "jsx": "react-jsx",
      "jsxImportSource": "preact",
      "types": ["vite/client", "node"],
      "baseUrl": ".",
      "paths": {
         "@/*": ["./src/*"],
         "react": ["./node_modules/preact/compat/"],
         "react-dom": ["./node_modules/preact/compat/"]
      }
   },
   "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"],
   "exclude": ["dist"]
}
```

### Critical rules

- Always import React APIs from `'react'` (aliased). Never import `useState`
  from `'preact/hooks'` — that bypasses `preact/compat` and breaks consumers.
- `skipLibCheck: true` is mandatory (React library types vs. Preact compat
  types).
- If `react`/`react-dom` paths are missing from `tsconfig`, the app still
  _runs_ but every component reports “Cannot find module ‘react’”.

### Dependency rule

Allowed:

```bash
pnpm --filter @caly/webapp add preact preact-iso
```

Not allowed:

```bash
pnpm --filter @caly/webapp add react react-dom react-router-dom
```

## 8. Routing

### Frontend routing

The webapp uses **`preact-iso`**. It provides `Router`, `Route`,
`LocationProvider`, `useLocation`, `useRoute`, and `lazy`, supports nested
routes and path segments (`:param`, `:param?`, `:param*`, `:param+`, `*`), and
preserves the outgoing route while an incoming async route loads.

> **Correction from the first draft:** `preact-iso` has **no `Link` export**.
> Navigation uses **plain `<a href>` elements**, which preact-iso intercepts for
> client-side navigation. Do not `import { Link } from "preact-iso"`.

### Routing principles

- Use client-side routing for application views.
- Use lazy-loaded route components for major sections.
- Preserve the current view while the next async route resolves.
- Keep route components thin; delegate data access to feature hooks/services.
- Use typed route parameters where possible.
- Keep navigation accessible with real anchor (`<a>`) elements.
- Do not couple route components directly to Worker bindings, Frostbase clients,
  or database repositories.

### Route files

`preact-iso` is **not** file-based routing. Routes are declared explicitly in
`App.tsx`. Filenames are plain module names (no Next-style `[id].tsx`), and the
catch-all is expressed with the `default` prop.

```text
packages/webapp/src/routes/
├── home.tsx
├── dashboard.tsx
├── settings.tsx
├── examples/
│   ├── list.tsx
│   └── detail.tsx
└── not-found.tsx
```

### Router

`packages/webapp/src/App.tsx`:

```tsx
import { Route, Router } from 'preact-iso';
import { AppShell } from './components/app-shell';
import { AgentationToolbar } from './lib/agentation';
import { Dashboard } from './routes/dashboard';
import { ExampleDetail } from './routes/examples/detail';
import { ExampleList } from './routes/examples/list';
import { Home } from './routes/home';
import { NotFound } from './routes/not-found';
import { Settings } from './routes/settings';

export function App() {
   return (
      <AppShell>
         <Router>
            <Route
               path='/'
               component={Home}
            />
            <Route
               path='/dashboard'
               component={Dashboard}
            />
            <Route
               path='/settings'
               component={Settings}
            />
            <Route
               path='/examples'
               component={ExampleList}
            />
            <Route
               path='/examples/:id'
               component={ExampleDetail}
            />
            <Route
               default
               component={NotFound}
            />
         </Router>

         <AgentationToolbar />
      </AppShell>
   );
}
```

### Navigation

Use plain anchors; preact-iso intercepts them. For programmatic navigation, use
`useLocation().route`.

```tsx
import { useLocation } from 'preact-iso';

export function DashboardNav() {
   return (
      <nav>
         <a href='/dashboard'>Dashboard</a>
         <a href='/settings'>Settings</a>
      </nav>
   );
}

export function ExampleLink({ id }: { id: string }) {
   const { route } = useLocation();

   return (
      <a
         href={`/examples/${id}`}
         onClick={(e) => {
            e.preventDefault();
            route(`/examples/${id}`);
         }}
      >
         Open
      </a>
   );
}
```

### Backend routing

The API Worker uses **Hono**, a lightweight, Web-standard framework with routing,
middleware, JSON handling, and typed access to Worker bindings. Routes are
**explicit route modules**, not file-based:

```text
/api/v1/health
/api/v1/examples
/api/v1/examples/:id
```

## 9. shadcn and shared UI

### Ownership boundary

| Code type                          | Location                         |
| ---------------------------------- | -------------------------------- |
| Generated shadcn primitives        | `packages/ui/src/components`     |
| Shared UI hooks                    | `packages/ui/src/hooks`          |
| `cn` utility and shared UI helpers | `packages/ui/src/lib`            |
| App-specific composed components   | `packages/webapp/src/components` |
| Feature-specific components        | `packages/webapp/src/features`   |
| Routes and pages                   | `packages/webapp/src/routes`     |

`packages/webapp/src/components/ui/` must **not** exist.

### Shared UI package

`packages/ui/package.json`:

```json
{
   "name": "@caly/ui",
   "private": true,
   "type": "module",
   "exports": {
      "./components/*": "./src/components/*.tsx",
      "./hooks/*": "./src/hooks/*.ts",
      "./lib/*": "./src/lib/*.ts"
   },
   "imports": {
      "#components/*": "./src/components/*.tsx",
      "#hooks/*": "./src/hooks/*.ts",
      "#lib/*": "./src/lib/*.ts"
   },
   "dependencies": {
      "@base-ui/react": "^1.5.0",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "lucide-react": "^1.17.0",
      "tailwind-merge": "^3.6.0"
   },
   "peerDependencies": {
      "preact": "*"
   }
}
```

`packages/ui/tsconfig.json` must mirror the webapp’s React aliasing
(`jsxImportSource: "preact"`, `paths` for `react`/`react-dom`,
`skipLibCheck: true`) so the package type-checks standalone against Base UI’s
React types.

`packages/ui/src/lib/` also holds `preact-compat.ts`, which strips the `ref`
prop before it crosses the React→Preact boundary (Base UI types `ref` as a
callback taking `never`, which Preact’s ref type rejects). The generated
primitives forward their props through it.

### Shared UI shadcn config

`packages/ui/components.json`:

```json
{
   "$schema": "https://ui.shadcn.com/schema.json",
   "style": "base-mira",
   "rsc": false,
   "tsx": true,
   "tailwind": {
      "config": "",
      "css": "../webapp/src/styles/globals.css",
      "baseColor": "neutral",
      "cssVariables": true,
      "prefix": ""
   },
   "iconLibrary": "lucide",
   "aliases": {
      "components": "#components",
      "ui": "#components",
      "lib": "#lib",
      "hooks": "#hooks",
      "utils": "#lib/utils"
   }
}
```

### Webapp shadcn config

`packages/webapp/components.json`:

```json
{
   "$schema": "https://ui.shadcn.com/schema.json",
   "style": "base-mira",
   "rsc": false,
   "tsx": true,
   "tailwind": {
      "config": "",
      "css": "./src/styles/globals.css",
      "baseColor": "neutral",
      "cssVariables": true,
      "prefix": ""
   },
   "iconLibrary": "lucide",
   "aliases": {
      "components": "#components",
      "ui": "@caly/ui/components",
      "lib": "#lib",
      "hooks": "@caly/ui/hooks",
      "utils": "@caly/ui/lib/utils"
   }
}
```

The decisive aliases are `"ui": "@caly/ui/components"` and
`"utils": "@caly/ui/lib/utils"`; shadcn’s monorepo resolution routes generated
primitives into the workspace package that `exports` those paths. Keep `style`,
`baseColor`, `iconLibrary`, and Tailwind settings **identical** between the two
`components.json` files.

### Adding components

Always run shadcn from the webapp:

```bash
pnpm --filter @caly/webapp exec shadcn@latest add button card dialog dropdown-menu
```

Expected output:

```text
packages/ui/src/components/button.tsx
packages/ui/src/components/card.tsx
packages/ui/src/components/dialog.tsx
packages/ui/src/components/dropdown-menu.tsx
packages/ui/src/lib/utils.ts
```

### Consuming components

```tsx
import { Button } from '@caly/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@caly/ui/components/card';

export function DeploymentCard() {
   return (
      <Card>
         <CardHeader>
            <CardTitle>Deployment</CardTitle>
         </CardHeader>
         <CardContent>
            <Button>Deploy</Button>
         </CardContent>
      </Card>
   );
}
```

### Compatibility gate (D3)

Immediately after generating the first batch, verify in the running app that
`Dialog`, `DropdownMenu`, `Select`, and `Popover` open, close, and position
correctly under `preact/compat`. If any hang, switch those components (or the
whole style) to Radix. Record the outcome in
`docs/preact-shadcn-baseui-tailwind.md`.

## 10. Theming and presets

Theming uses **CSS-variable token sets** managed by the shadcn CLI. Theme
presets change design tokens, not component implementations.

> **Correction from the first draft:** the first draft hand-maintained a
> `themes/*.css` directory _and_ ran `shadcn apply --preset`. Those conflict —
> `shadcn apply` writes tokens into the CSS entry declared in `components.json`.
> Use a **single Tailwind entry file** as the source of truth; optionally import
> hand-authored preset files into it.

```text
packages/webapp/src/styles/
├── globals.css            # Tailwind entry + default tokens (managed by shadcn apply)
└── presets/               # optional, hand-authored overrides imported by globals.css
    ├── midnight.css
    └── warm-paper.css
```

`packages/webapp/src/styles/globals.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@source '../../../ui/src';
@import '@fontsource-variable/roboto';
@import '@fontsource-variable/noto-sans';

@custom-variant dark (&:is(.dark *));

:root {
   --background: oklch(0.98 0.01 95);
   --foreground: oklch(0.2 0.02 40);
   --primary: oklch(0.55 0.18 35);
   --radius: 0.75rem;
}

.dark {
   --background: oklch(0.16 0.02 260);
   --foreground: oklch(0.95 0.02 260);
}

@theme inline {
   --color-background: var(--background);
   --color-foreground: var(--foreground);
   --color-primary: var(--primary);
   --radius-lg: var(--radius);
}

@layer base {
   * {
      @apply border-border outline-ring/50;
   }

   body {
      @apply bg-background text-foreground;
   }
}
```

Apply a complete preset:

```json
{
   "scripts": {
      "theme:apply": "shadcn apply"
   }
}
```

```bash
# Full preset (components + tokens)
pnpm --filter @caly/webapp theme:apply -- --preset <PRESET_CODE>

# Tokens only
pnpm --filter @caly/webapp theme:apply -- <PRESET_CODE> --only theme
```

Keep `style`, `baseColor`, `iconLibrary`, and Tailwind settings aligned between
`packages/webapp/components.json` and `packages/ui/components.json`.

## 11. Web application

### Directory layout

```text
packages/webapp/
├── components.json
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── wrangler.jsonc
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── worker.ts
    ├── routes/
    ├── features/
    ├── components/
    │   ├── theme-switcher.tsx
    │   └── app-shell.tsx
    ├── lib/
    │   ├── agentation.tsx
    │   ├── api/
    │   │   ├── client.ts
    │   │   └── examples.ts
    │   ├── frostbase/            # optional; only auth, realtime, storage
    │   │   ├── auth.ts
    │   │   ├── realtime.ts
    │   │   └── storage.ts
    │   └── theme.ts
    └── styles/
        └── globals.css
```

### App root and providers

`ThemeProvider` is outermost (it controls the `<html>` class); routing and
tooltip providers nest inside it. The `AgentationToolbar` mounts once at the app
root, **not** inside individual routes.

```tsx
import { render } from 'preact';
import { LocationProvider } from 'preact-iso';
import { App } from './App';
import { ThemeProvider } from './lib/theme';
import './styles/globals.css';

render(
   <ThemeProvider>
      <LocationProvider>
         <App />
      </LocationProvider>
   </ThemeProvider>,
   document.getElementById('app')!,
);
```

## 12. Cloudflare Workers

### Frontend Worker

The webapp Worker serves the built static assets and, with
`not_found_handling: "single-page-application"`, lets client-side routes such as
`/dashboard` and `/examples/:id` be handled by the Preact router instead of
404-ing. The Worker script is a thin ASSETS forwarder, kept so edge logic
(redirects, preview behavior) has a home later.

`packages/webapp/wrangler.jsonc`:

```jsonc
{
   "name": "caly-cloud-web",
   "main": "src/worker.ts",
   "compatibility_date": "2026-10-01",
   "assets": {
      "directory": "./dist/client",
      "binding": "ASSETS",
      "not_found_handling": "single-page-application",
   },
   "observability": {
      "enabled": true,
   },
}
```

`packages/webapp/src/worker.ts`:

```ts
type Env = {
   ASSETS: {
      fetch(request: Request): Promise<Response>;
   };
};

export default {
   async fetch(request: Request, env: Env): Promise<Response> {
      return env.ASSETS.fetch(request);
   },
};
```

### API Worker

The API Worker is separate from the frontend Worker and starts with **no
bindings** (D6).

`packages/api/wrangler.jsonc`:

```jsonc
{
   "name": "caly-cloud-api",
   "main": "src/index.ts",
   "compatibility_date": "2026-10-01",
   "observability": {
      "enabled": true,
   },
   "vars": {
      "API_VERSION": "v1",
   },
}
```

Add D1, R2, KV, Queues, Durable Objects, AI bindings, or Frostbase
configuration **only when a feature requires them**, and extend `ApiEnv` at the
same time.

### Production topology (D4)

Both Workers deploy to the **same Cloudflare zone**. A route binds `/api/*` to
the API Worker, and the web Worker serves everything else with SPA fallback:

```jsonc
// packages/api/wrangler.jsonc (added at deploy time)
{
   "routes": [
      {
         "pattern": "app.example.com/api/*",
         "zone_name": "example.com",
      },
   ],
}
```

The webapp’s production `VITE_API_BASE_URL=/api/v1` therefore resolves to the
API Worker through the same origin.

## 13. Shared API contracts

`@caly/shared` is the single source of truth for API request/response schemas.

```text
packages/shared/src/
├── api/
│   ├── examples.ts
│   └── index.ts
├── types/
└── index.ts
```

`packages/shared/src/api/examples.ts`:

```ts
import { z } from 'zod';

export const createExampleInputSchema = z.object({
   name: z.string().min(1).max(120),
});

export type CreateExampleInput = z.infer<typeof createExampleInputSchema>;

export const exampleSchema = z.object({
   id: z.string(),
   name: z.string(),
   createdAt: z.string(),
});

export type Example = z.infer<typeof exampleSchema>;
```

Both the Preact client and the Hono API import these schemas from
`@caly/shared`.

## 14. API layer

### Directory layout

```text
packages/api/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── wrangler.jsonc
├── .dev.vars.example
└── src/
    ├── index.ts
    ├── env.ts
    ├── middleware/
    │   ├── cors.ts
    │   ├── error-handler.ts
    │   └── request-context.ts
    ├── routes/
    │   ├── health.ts
    │   ├── examples.ts
    │   └── index.ts
    ├── services/
    │   └── example-service.ts
    ├── repositories/
    │   └── example-repository.ts
    └── lib/
        └── validation.ts
```

Frostbase-only files (`middleware/auth.ts`, `infrastructure/frostbase/**`) are
added only when the optional preset is enabled (§15); the base tree omits them.

### Dependencies

Base API dependencies:

```bash
pnpm --filter @caly/api add hono zod @caly/shared @caly/worker-kit
pnpm --filter @caly/api add -D @cloudflare/workers-types wrangler vitest
```

Frostbase dependencies are added only when the backend preset is enabled.

### Typed environment

`packages/api/src/env.ts` — starts minimal; bindings and Frostbase values are
added per feature (D6, D7):

```ts
import type { RequestContextVars } from '@caly/worker-kit';

export type ApiEnv = {
   API_VERSION: string;

   // Add when a feature needs them:
   // DB: D1Database;
   // STORAGE: R2Bucket;
   // CACHE: KVNamespace;
   // AUTH_SECRET: string;

   // Add when the Frostbase preset is enabled:
   // FROSTBASE_PROJECT_ID: string;
   // FROSTBASE_BASE_URL: string;
   // FROSTBASE_SERVER_KEY: string;
};

/** Hono environment for every route in this Worker. */
export type AppBindings = {
   Bindings: ApiEnv;
   Variables: RequestContextVars;
};
```

### Hono application

`packages/api/src/index.ts`:

```ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { AppBindings } from './env';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { requestContext } from './middleware/request-context';
import { registerRoutes } from './routes';

export const app = new Hono<AppBindings>();

app.use('*', logger());
app.use('*', requestContext());
app.use('/api/v1/*', corsMiddleware);

registerRoutes(app);

app.onError(errorHandler);

export default app;
```

### Example route

`packages/api/src/routes/examples.ts`:

```ts
import { Hono } from 'hono';
import { createExampleInputSchema } from '@caly/shared';
import type { AppBindings } from '../env';
import { parse } from '../lib/validation';
import { createExample } from '../services/example-service';

export const exampleRoutes = new Hono<AppBindings>()
   .get('/', (c) => c.json({ data: [] }))
   .post('/', async (c) => {
      const input = parse(createExampleInputSchema, await c.req.json());
      const example = await createExample(c.env, input);
      return c.json({ data: example }, 201);
   });
```

### Response conventions

Success:

```json
{ "data": {}, "meta": {} }
```

Error:

```json
{
   "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid request body",
      "details": []
   }
}
```

| Status | Use                                   |
| ------ | ------------------------------------- |
| 200    | Successful read or update             |
| 201    | Resource created                      |
| 204    | Successful deletion or empty response |
| 400    | Invalid client input                  |
| 401    | Missing or invalid authentication     |
| 403    | Authenticated but not authorized      |
| 404    | Resource not found                    |
| 409    | Conflict                              |
| 422    | Validation failure                    |
| 429    | Rate limit exceeded                   |
| 500    | Unexpected server error               |

### Backend architecture rules

- Keep route handlers thin.
- Put business logic in services.
- Put database and storage access in repositories.
- Validate every external input with Zod schemas from `@caly/shared`.
- Map database rows to API response schemas; do not expose raw rows.
- Use typed Worker bindings.
- Do not import `@caly/webapp` from `@caly/api`.
- Keep secrets in Wrangler secrets or `.dev.vars`; never commit them.
- Keep Frostbase SDK usage confined to `src/infrastructure/frostbase`.

## 15. Frostbase backend preset

Frostbase is an optional backend preset built on Cloudflare Workers, Durable
Objects, and R2. It provides:

- Better Auth-based authentication
- Schemaless document collections
- Typed single-table SQLite tables via Drizzle
- Realtime document subscriptions
- R2-backed object storage
- Remote configuration and feature flags

Frostbase is **not enabled by default**. The base starter remains Hono-only and
binding-free (D6).

### Enablement

Create a Frostbase project and add only the agents required by the application:

```bash
pnpm dlx @frostbase-dev/cli init frostbase-backend
cd frostbase-backend

frostbase add auth
frostbase add db

# Add only when needed:
frostbase add storage
```

Deploy the selected agents:

```bash
frostbase deploy
```

A project may use either a hosted Frostbase deployment or a self-hosted
deployment in its own Cloudflare account. The starter must not assume one mode;
all project-specific values come from environment configuration.

### Architecture

```text
Preact SPA
   │
   ├── /api/v1/* ──► Hono API Worker
   │                    ├── Frostbase auth verification
   │                    ├── Frostbase db / storage clients
   │                    ├── domain services + authorization
   │                    └── shared Zod contracts
   │
   └── optional direct Frostbase calls
        ├── auth endpoints
        ├── realtime subscriptions
        └── storage upload URLs
```

### Environment

Extend `ApiEnv` only when Frostbase is enabled:

```ts
export type ApiEnv = {
   API_VERSION: string;

   FROSTBASE_PROJECT_ID: string;
   FROSTBASE_BASE_URL: string;
   FROSTBASE_SERVER_KEY: string;
};
```

Secrets belong in `.dev.vars` locally and Wrangler secrets in production:

```bash
npx wrangler secret put FROSTBASE_SERVER_KEY
```

### Repository boundary

Services must depend on interfaces, not Frostbase directly:

```ts
export interface ExampleRepository {
   create(userId: string, input: CreateExampleInput): Promise<Example>;
   listForUser(userId: string): Promise<Example[]>;
}
```

The Frostbase implementation:

```ts
import type { ExampleRepository } from '../../repositories/example-repository';
import type { CreateExampleInput, Example } from '@caly/shared';

export function createFrostbaseExampleRepository(db: FrostbaseDbClient): ExampleRepository {
   const examples = db.collection('examples');

   return {
      async create(userId, input) {
         const document = await examples.create({
            ...input,
            userId,
         });

         return mapExample(document);
      },

      async listForUser(userId) {
         const documents = await examples.query({
            where: { userId },
         });

         return documents.map(mapExample);
      },
   };
}
```

Routes remain thin and provider-agnostic:

```ts
exampleRoutes.post('/', async (context) => {
   const input = createExampleInputSchema.parse(await context.req.json());
   const user = await requireUser(context);

   const example = await exampleService.create(context.env.exampleRepository, user.id, input);

   return context.json({ data: example }, 201);
});
```

### Data modeling rules

- Use **collections** for flexible document data, drafts, notes, and rapidly
  evolving prototypes.
- Use **SQL tables** for stable, strongly typed entities.
- Do not design around cross-table joins: Frostbase SQL tables are
  single-table; use read-only views for limited reporting joins.
- Map Frostbase documents/rows to Zod schemas from `@caly/shared` before
  returning them from API routes.
- Store `userId` and ownership fields explicitly; do not rely on
  client-supplied ownership data.

### Authorization rules

Frostbase authentication establishes identity. Hono services establish
authorization.

Every protected route must:

1. Resolve the authenticated user.
2. Validate the request with `@caly/shared` Zod schemas.
3. Apply ownership/role checks in the service layer.
4. Pass a scoped query or explicit `userId` to the repository.

Never infer authorization from the fact that a request reached the API.

### Direct browser access

Allowed only for:

```text
auth flows
realtime subscriptions
storage upload URLs
```

All other Frostbase access occurs from `@caly/api`.

### Removal path

Because Frostbase is isolated behind repository interfaces, an application can
replace it with D1, R2, another BaaS, or a custom Worker-backed implementation
without changing route handlers or service logic.

## 16. `@caly/worker-kit`

Kept because it has concrete consumers (D6). It holds **binding-agnostic**
Worker helpers:

- `createCors(origin)` — a CORS middleware factory used by `@caly/api`.
- `errorEnvelope(code, message, details?)` and `ok(data, meta?)` — the standard
  JSON envelope helpers shared by all API routes.
- `requestContext()` — correlation-id / request-scoped context middleware.
- `withTimeout` / small fetch helpers for outbound Worker requests.

It must not import from any application package and must not assume specific
bindings. If, by the end of the spike, it has fewer than two real consumers,
fold it into `@caly/api` and delete the package.

## 17. Frontend API client

`packages/webapp/src/lib/api/client.ts` parses the shared response envelope and
throws a typed error on failure:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api/v1';

export class ApiError extends Error {
   constructor(
      readonly status: number,
      readonly code: string,
      message: string,
      readonly details?: unknown,
   ) {
      super(message);
   }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
   const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
         'Content-Type': 'application/json',
         ...init?.headers,
      },
   });

   const payload = await response.json().catch(() => null);

   if (!response.ok) {
      const error = payload?.error;

      throw new ApiError(
         response.status,
         error?.code ?? 'UNKNOWN',
         error?.message ?? `Request failed: ${response.status}`,
         error?.details,
      );
   }

   return payload as T;
}
```

`packages/webapp/src/lib/api/examples.ts`:

```ts
import type { Example } from '@caly/shared';
import { apiFetch } from './client';

export function listExamples() {
   return apiFetch<{ data: Example[] }>('/examples');
}
```

### Frostbase-aware frontend modules

The frontend API client remains the default data-access path. It calls Hono, not
Frostbase, for normal CRUD operations.

Create separate, explicitly named modules only for permitted direct Frostbase
use:

```text
packages/webapp/src/lib/frostbase/
├── auth.ts
├── realtime.ts
└── storage.ts
```

Rules:

- Do not import Frostbase clients inside route components.
- Wrap direct Frostbase calls in feature-level hooks or service modules.
- Never place Frostbase server keys in the webapp.
- Use environment variables only for public/project-level client configuration.

## 18. Agentation integration

Agentation provides visual UI feedback for AI coding agents: developers click
elements in the running preview, add notes, and the connected agent receives
structured context via MCP. Agentation is **React-only** and relies on the
`react` → `preact/compat` alias (§7).

### Installation

```bash
pnpm --filter @caly/webapp add agentation
pnpm --filter @caly/webapp add -D agentation-mcp
```

### MCP registration

```bash
claude mcp add agentation -- npx -y agentation-mcp server
```

Generic MCP configuration:

```json
{
   "mcpServers": {
      "agentation": {
         "command": "npx",
         "args": ["-y", "agentation-mcp", "server"]
      }
   }
}
```

### Toolbar component

`packages/webapp/src/lib/agentation.tsx`:

```tsx
import { Agentation } from 'agentation';

export function AgentationToolbar() {
   if (!import.meta.env.DEV) return null;

   return <Agentation endpoint='http://localhost:4747' />;
}
```

Agentation must never render in production builds.

## 19. Turborepo and remote caching

### Root scripts

```json
{
   "scripts": {
      "dev": "turbo run dev",
      "build": "turbo run build",
      "lint": "turbo run lint",
      "check-types": "turbo run check-types",
      "test": "turbo run test",
      "knip": "knip",
      "format": "prettier --write .",
      "format:check": "prettier --check .",
      "deploy:web": "pnpm --filter @caly/webapp deploy",
      "deploy:api": "pnpm --filter @caly/api deploy",
      "deploy": "pnpm deploy:api && pnpm deploy:web",
      "theme:apply": "pnpm --filter @caly/webapp theme:apply",
      "prepare": "husky"
   }
}
```

### Turbo task graph

```json
{
   "$schema": "https://turbo.build/schema.json",
   "tasks": {
      "build": {
         "dependsOn": ["^build"],
         "inputs": ["$TURBO_DEFAULT$", ".env*"],
         "outputs": ["dist/**", ".wrangler/**"]
      },
      "dev": {
         "cache": false,
         "persistent": true
      },
      "lint": {},
      "check-types": {
         "dependsOn": ["^check-types"]
      },
      "test": {
         "dependsOn": ["^build"]
      }
   }
}
```

### Remote cache (D5)

Remote caching is **enabled but credentials are supplied on demand**:

```bash
# One-time per developer, when credentials are available
npx turbo login
npx turbo link
```

- Env vars: `TURBO_TOKEN`, `TURBO_TEAM`. A custom cache host uses `TURBO_API`.
- When these are **unset**, Turborepo runs with local cache only. Tasks must
  never fail because remote cache is unavailable.
- CI injects them from repository secrets when present; the workflow tolerates
  their absence.
- The project owner provides the remote-cache URL and API key per project when
  needed; they are never committed.

## 20. Local development

| Service       | URL                     |
| ------------- | ----------------------- |
| Preact webapp | `http://localhost:5173` |
| API Worker    | `http://localhost:8787` |
| Agentation    | `http://localhost:4747` |

`.env.example` (webapp):

```env
VITE_API_BASE_URL=http://localhost:8787/api/v1
```

`.dev.vars.example` (API, only when Frostbase is enabled):

```env
FROSTBASE_PROJECT_ID=your-frostbase-project-id
FROSTBASE_BASE_URL=https://frostbase.dev
FROSTBASE_SERVER_KEY=replace-with-server-key
```

### Quality gates

Every pull request must pass:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm knip
```

Required tooling: ESLint, Prettier, TypeScript, Vitest, Knip, Husky,
lint-staged, GitHub Actions.

## 21. CI pipeline

```yaml
name: CI

on:
   push:
      branches: [main]
   pull_request:

jobs:
   verify:
      runs-on: ubuntu-latest
      env:
         # Remote cache is optional (D5); empty values are fine.
         TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
         TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
      steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
         - uses: actions/setup-node@v4
           with:
              node-version: 22
              cache: pnpm
         - run: pnpm install --frozen-lockfile
         - run: pnpm lint
         - run: pnpm check-types
         - run: pnpm test
         - run: pnpm build
         - run: pnpm knip
```

Deployment is a separate workflow (`.github/workflows/deploy.yml`), triggered
manually or after a successful merge to `main`; it deploys the API Worker first,
then the frontend Worker.

## 22. Agent conventions

### AGENTS.md

```md
# Caly Cloud — Agent Guide

## Architecture

- `packages/webapp` is the Preact SPA and frontend Worker.
- `packages/api` is the backend Hono API Worker (starts with no bindings).
- `packages/ui` contains reusable shadcn (Base UI) primitives.
- `packages/shared` contains API contracts, schemas, types, and domain utilities.
- `packages/worker-kit` contains binding-agnostic Worker utilities.
- Frostbase is an optional backend preset, not the default API framework.

## Routing

- Use `preact-iso` for frontend routing. There is NO `Link` export — use plain
  `<a href>` elements; preact-iso intercepts them.
- Do not add React Router.
- Route files are plain module names declared explicitly in `App.tsx`.
- Use Hono route modules for API routing.

## Preact rules

- React imports resolve to `preact/compat` via Vite AND tsconfig paths. Both
  layers are mandatory; keep them in sync.
- Never `import` from `preact/hooks` directly; import from `'react'`.
- Do not add `react` or `react-dom` as runtime dependencies.
- Keep `process.env.IS_PREACT` defined and the Preact preset's built-in React
  aliases disabled (see `packages/webapp/vite.config.ts`).

## shadcn rules

- Run shadcn from `packages/webapp`.
- Generated primitives land in `packages/ui/src/components`.
- Never create `packages/webapp/src/components/ui`.
- Import primitives as `@caly/ui/components/*`.
- Keep `components.json` design settings aligned between webapp and UI.
- Base UI is unofficial under Preact; smoke-test Dialog/Dropdown/Select/Popover
  after adding components.

## API rules

- Validate all external input with Zod schemas from `packages/shared`.
- Keep route handlers thin; use services for business logic and repositories
  for data access.
- Use the shared response envelope from `@caly/worker-kit`.
- Start with no bindings; add D1/R2/KV (and extend `ApiEnv`) only when a feature
  requires them.
- Do not import `packages/webapp` from `packages/api`.

## Frostbase rules

- Frostbase is optional; do not add it unless the project enables the backend
  preset.
- Hono remains the API boundary for normal CRUD and sensitive operations.
- Put Frostbase clients only in
  `packages/api/src/infrastructure/frostbase/`.
- Services depend on repository interfaces, not Frostbase SDK types.
- Validate all external input with Zod schemas from `packages/shared`.
- Apply authorization in Hono services; Frostbase auth only establishes
  identity.
- The webapp may use Frostbase directly only for auth, realtime, and storage
  uploads.
- Do not expose server keys or raw Frostbase documents to the frontend.

## Remote cache

- Turborepo remote cache is opt-in. Never make tasks fail when `TURBO_TOKEN` /
  `TURBO_TEAM` are unset.

## UI feedback

- Use Agentation during UI development (development only).
- Read pending annotations before implementing UI changes.
- Resolve annotations only after verifying the implemented change.
```

### CONTEXT.md

```md
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
```

## 23. Implementation plan (tracer bullets)

1. Initialize the pnpm workspace and Turborepo.
2. Add root TypeScript, ESLint (flat), Prettier, Knip, Husky, and Vitest config.
3. Create `@caly/webapp` with Vite, Preact, Tailwind v4, and the Cloudflare Vite
   plugin. **Apply the D2 Vite/tsconfig aliasing verbatim.**
4. Add `preact-iso` and the initial route shell (plain anchors, no `Link`).
5. Create `@caly/ui` with the shadcn monorepo aliases; add `button`, `card`,
   `dialog`; confirm generation lands in `packages/ui`.
6. **Run the D3 compatibility gate** on Dialog/Dropdown/Select/Popover; record
   the outcome.
7. Add theme tokens + `globals.css` and a `ThemeSwitcher`.
8. Create `@caly/api` with Hono, health routes, a minimal `ApiEnv`, error
   handling, and the shared envelope from `worker-kit`.
9. Add shared Zod contracts in `@caly/shared` and the typed frontend API client.
10.   Add the optional Frostbase backend preset:
      - repository interfaces in `@caly/api/src/repositories`
      - Frostbase infrastructure in
        `@caly/api/src/infrastructure/frostbase`
      - auth middleware and a protected example route
      - `.dev.vars.example` entries for Frostbase configuration
11.   Add Agentation in development and register its MCP server.
12.   Configure the production `/api/*` same-zone route (D4).
13.   Wire Turborepo remote cache as opt-in (D5) and add CI.
14.   Deploy the API Worker, then the frontend Worker.

## 24. Definition of done

The starter is complete when:

- `pnpm dev` runs both the Preact webapp and API Worker locally.
- `pnpm build` produces Cloudflare Worker-compatible builds.
- `pnpm deploy` deploys the API Worker followed by the frontend Worker.
- `preact-iso` handles client-side navigation via intercepted anchors.
- Hono handles versioned API routes.
- shadcn components are generated into `packages/ui`.
- The webapp imports primitives through `@caly/ui/components/*`.
- React imports resolve to Preact compatibility via both Vite and tsconfig.
- The Base UI compatibility gate has a recorded pass (or the Radix fallback was
  taken).
- Theme presets can be switched without rewriting components.
- Agentation annotations appear in the connected coding agent.
- Turborepo remote cache works when credentials are present and is a no-op when
  they are absent.
- CI passes lint, typecheck, tests, build, and Knip.
- `AGENTS.md` and `CONTEXT.md` accurately describe the repository.
- The base starter runs with Hono only and no Frostbase dependency.
- When the Frostbase preset is enabled:
   - Frostbase clients are confined to
     `packages/api/src/infrastructure/frostbase`.
   - Services consume repository interfaces rather than Frostbase SDK types.
   - Protected API routes resolve and authorize the authenticated user.
   - Direct webapp Frostbase usage is limited to auth, realtime, and uploads.
   - Frostbase responses are mapped to shared Zod schemas before leaving the API.

## 25. Known risks

| Risk                                                               | Mitigation                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Base UI breaks under `preact/compat` (Dialog hang is a known case) | D3 compatibility gate; Radix fallback                                              |
| shadcn monorepo aliasing writes to the wrong package               | Verify file paths after the first `add`; keep both `components.json` files aligned |
| Agentation is React-only                                           | Depends on the `react` alias; verify it mounts in dev                              |
| Web↔API 404 in production                                          | D4 same-zone `/api/*` route, tested before launch                                  |
| Remote cache credentials unavailable                               | D5 opt-in; tasks must not fail when unset                                          |
| `packages/worker-kit` becomes dead weight                          | Fold into `@caly/api` and delete if <2 real consumers                              |
| Frostbase becomes tightly coupled to application code              | D7/D8 repository boundary; Frostbase only in infrastructure code                   |
| Client-side authorization is assumed because auth exists           | D9: all writes and sensitive reads pass through Hono authorization                 |
| Frostbase SQL model does not fit relational requirements           | Use collections, denormalized fields, application-level joins, or read-only views  |
| Frostbase project maturity/API changes                             | Isolate SDK usage behind adapters; keep the base template Frostbase-free           |
