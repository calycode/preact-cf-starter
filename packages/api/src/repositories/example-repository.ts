import type { CreateExampleInput, Example } from '@caly/shared';
import type { ApiEnv } from '../env';

/**
 * In-memory example repository.
 *
 * Replace with D1/R2 access (and extend `ApiEnv`) once a feature needs
 * persistence — the API starts with no bindings (SPEC D6).
 */
export async function insertExample(_env: ApiEnv, input: CreateExampleInput): Promise<Example> {
   return {
      id: crypto.randomUUID(),
      name: input.name,
      createdAt: new Date().toISOString(),
   };
}
