import type { Hono } from 'hono';
import type { AppBindings } from '../env';
import { exampleRoutes } from './examples';
import { healthRoutes } from './health';

/** Mount all versioned API routes onto the application. */
export function registerRoutes(app: Hono<AppBindings>) {
   app.route('/api/v1/health', healthRoutes);
   app.route('/api/v1/examples', exampleRoutes);
   return app;
}
