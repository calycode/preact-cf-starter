import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { AppBindings } from './env';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { requestContext } from './middleware/request-context';
import { registerRoutes } from './routes';

export const app = new Hono<AppBindings>();

app.use('*', logger());
app.use('*', requestContext());
app.use('/api/v1/*', corsMiddleware);

registerRoutes(app);

app.onError(errorHandler);

export default app;
