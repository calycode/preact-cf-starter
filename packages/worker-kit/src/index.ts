import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

/** Variables attached to the Hono request context by {@link requestContext}. */
export type RequestContextVars = {
   requestId: string;
   startedAt: number;
};

/** Standard success envelope (see SPEC §14). */
export function ok<T>(data: T, meta?: Record<string, unknown>) {
   return meta ? { data, meta } : { data };
}

export type ApiErrorBody = {
   error: {
      code: string;
      message: string;
      details?: unknown;
   };
};

/** Standard error envelope (see SPEC §14). */
export function errorEnvelope(code: string, message: string, details?: unknown): ApiErrorBody {
   return { error: details === undefined ? { code, message } : { code, message, details } };
}

/** Adds a correlation id and start time to the request context. */
export function requestContext(): MiddlewareHandler {
   return async (c, next) => {
      const requestId =
         c.req.header('cf-ray') ?? c.req.header('x-request-id') ?? crypto.randomUUID();
      c.set('requestId', requestId);
      c.set('startedAt', Date.now());
      c.header('x-request-id', requestId);
      await next();
   };
}

/** Binding-agnostic CORS middleware factory. */
export function createCors(origin: string | string[] = '*'): MiddlewareHandler {
   return cors({
      origin,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
      maxAge: 86400,
   });
}

/** Reject if a promise does not settle within `ms` milliseconds. */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
   let timer: ReturnType<typeof setTimeout> | undefined;
   try {
      return await Promise.race([
         promise,
         new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
         }),
      ]);
   } finally {
      if (timer) clearTimeout(timer);
   }
}
