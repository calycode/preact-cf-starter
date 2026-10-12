# Frostbase backend preset (optional)

Frostbase is an **optional** backend preset built on Cloudflare Workers, Durable
Objects, and R2. It is **not enabled in this starter** — the base template is
Hono-only and binding-free (SPEC D6). Enable it only when a project needs auth,
document/SQL data, realtime, or object storage.

See SPEC §15 for the full design and decisions D7–D9. In short:

- Hono owns `/api/v1/*`, request validation, response envelopes, services, and
  authorization.
- Frostbase is reached only through repository adapters in
  `packages/api/src/infrastructure/frostbase/`.
- The webapp may talk to Frostbase directly only for auth, realtime
  subscriptions, and storage uploads.

## Enable (when needed)

```bash
pnpm dlx @frostbase-dev/cli init frostbase-backend
cd frostbase-backend
frostbase add auth
frostbase add db
# add only when needed: frostbase add storage
frostbase deploy
```

Then add the project values to `ApiEnv` (`packages/api/src/env.ts`) and
`.dev.vars` (`FROSTBASE_PROJECT_ID`, `FROSTBASE_BASE_URL`, `FROSTBASE_SERVER_KEY`)
and wire the repository adapters. Keep all Frostbase SDK usage inside
`packages/api/src/infrastructure/frostbase/`; services depend on repository
interfaces, never on Frostbase types.
