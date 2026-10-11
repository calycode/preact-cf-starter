import { Hono } from 'hono';
import { ok } from '@caly/worker-kit';
import type { AppBindings } from '../env';

export const healthRoutes = new Hono<AppBindings>().get('/', (c) =>
   c.json(ok({ status: 'ok', version: c.env.API_VERSION ?? 'unknown' })),
);
