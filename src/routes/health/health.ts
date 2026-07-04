import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'password-strength-microservice',
    requestId: randomUUID()
  }));
}
