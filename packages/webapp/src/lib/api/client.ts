import type { ApiFailure } from '@caly/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api/v1';

export class ApiError extends Error {
   constructor(
      readonly status: number,
      readonly code: string,
      message: string,
      readonly details?: unknown,
   ) {
      super(message);
      this.name = 'ApiError';
   }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
   const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
   });

   const payload = (await response.json().catch(() => null)) as ApiFailure | T | null;

   if (!response.ok) {
      const error = (payload as ApiFailure | null)?.error;
      throw new ApiError(
         response.status,
         error?.code ?? 'UNKNOWN',
         error?.message ?? `Request failed: ${response.status}`,
         error?.details,
      );
   }

   return payload as T;
}
