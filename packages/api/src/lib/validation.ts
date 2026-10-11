import type { ZodType } from 'zod';

/** Parse external input with a shared schema, throwing `ZodError` on failure. */
export function parse<T>(schema: ZodType<T>, value: unknown): T {
   return schema.parse(value);
}
