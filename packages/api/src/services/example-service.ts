import type { CreateExampleInput, Example } from '@caly/shared';
import type { ApiEnv } from '../env';
import { insertExample } from '../repositories/example-repository';

/** Business logic for the examples resource. */
export function createExample(env: ApiEnv, input: CreateExampleInput): Promise<Example> {
   return insertExample(env, input);
}
