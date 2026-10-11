import { describe, expect, it } from 'vitest';
import { createExampleInputSchema, exampleSchema } from './examples';

describe('examples contract', () => {
   it('accepts a valid create input', () => {
      expect(createExampleInputSchema.parse({ name: 'first' })).toEqual({ name: 'first' });
   });

   it('rejects an empty name', () => {
      expect(createExampleInputSchema.safeParse({ name: '' }).success).toBe(false);
   });

   it('parses an example', () => {
      const example = { id: '1', name: 'first', createdAt: new Date().toISOString() };
      expect(exampleSchema.parse(example)).toEqual(example);
   });
});
