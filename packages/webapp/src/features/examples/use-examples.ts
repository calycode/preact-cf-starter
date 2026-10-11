import type { Example } from '@caly/shared';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../lib/api/client';
import { createExample, listExamples } from '../../lib/api/examples';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Loads and mutates examples through the typed API client. */
export function useExamples() {
   const [examples, setExamples] = useState<Example[]>([]);
   const [status, setStatus] = useState<Status>('idle');
   const [error, setError] = useState<string | null>(null);

   const refresh = useCallback(async () => {
      setStatus('loading');
      setError(null);
      try {
         const result = await listExamples();
         setExamples(result.data);
         setStatus('ready');
      } catch (cause) {
         setError(cause instanceof ApiError ? cause.message : 'Failed to load examples');
         setStatus('error');
      }
   }, []);

   useEffect(() => {
      void refresh();
   }, [refresh]);

   const add = useCallback(async (name: string) => {
      try {
         const result = await createExample(name);
         setExamples((current) => [...current, result.data]);
      } catch (cause) {
         setError(cause instanceof ApiError ? cause.message : 'Failed to create example');
         setStatus('error');
      }
   }, []);

   return { examples, status, error, refresh, add };
}
