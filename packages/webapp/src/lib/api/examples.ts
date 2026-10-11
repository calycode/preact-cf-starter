import type { ApiSuccess, Example } from '@caly/shared';
import { apiFetch } from './client';

export function listExamples() {
   return apiFetch<ApiSuccess<Example[]>>('/examples');
}

export function createExample(name: string) {
   return apiFetch<ApiSuccess<Example>>('/examples', {
      method: 'POST',
      body: JSON.stringify({ name }),
   });
}
