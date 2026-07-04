import fastify, { type FastifyInstance } from 'fastify';
import { healthRoutes, passwordStrengthRoutes } from './routes/index.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: false
  });

  app.register(healthRoutes);
  app.register(passwordStrengthRoutes);

  return app;
}

export async function startServer() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3000);

  await app.listen({ host: '0.0.0.0', port });
}
