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
