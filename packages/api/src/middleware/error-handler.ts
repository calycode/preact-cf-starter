import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { errorEnvelope } from '@caly/worker-kit';

export const errorHandler: ErrorHandler = (err, c) => {
   if (err instanceof ZodError) {
      return c.json(errorEnvelope('VALIDATION_ERROR', 'Invalid request body', err.issues), 422);
   }

   if (err instanceof HTTPException) {
      return c.json(errorEnvelope('HTTP_ERROR', err.message), err.status);
   }

   console.error(err);
   return c.json(errorEnvelope('INTERNAL_ERROR', 'Unexpected server error'), 500);
};
