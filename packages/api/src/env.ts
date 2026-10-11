import type { RequestContextVars } from '@caly/worker-kit';

/**
 * Worker bindings and vars for the API.
 *
 * Starts minimal (SPEC D6). Add bindings here and to `wrangler.jsonc` only when
 * a feature needs them, e.g.:
 *
 *   DB: D1Database;
 *   STORAGE: R2Bucket;
 *   CACHE: KVNamespace;
 *   AUTH_SECRET: string;
 */
export type ApiEnv = {
   API_VERSION: string;
};

/** Hono environment for every route in this Worker. */
export type AppBindings = {
   Bindings: ApiEnv;
   Variables: RequestContextVars;
};
