import { createCors } from '@caly/worker-kit';

/** Origins allowed to call the API from a browser. */
export const corsMiddleware = createCors(['http://localhost:5173', 'https://app.example.com']);
