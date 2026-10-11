import { describe, expect, it } from 'vitest';
import { app } from './index';

describe('api', () => {
   it('responds to the health check', async () => {
      const res = await app.request('/api/v1/health', {}, { API_VERSION: 'v1' });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: { status: 'ok', version: 'v1' } });
   });

   it('creates an example', async () => {
      const res = await app.request('/api/v1/examples', {
         method: 'POST',
         headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ name: 'first' }),
      });
      expect(res.status).toBe(201);
      const body = (await res.json()) as { data: { name: string } };
      expect(body.data.name).toBe('first');
   });

   it('rejects invalid input', async () => {
      const res = await app.request('/api/v1/examples', {
         method: 'POST',
         headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ name: '' }),
      });
      expect(res.status).toBe(422);
   });
});
