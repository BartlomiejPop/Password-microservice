import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { evaluatePasswordStrength } from './password-strength.js';

const passwordStrengthRequestSchema = z.object({
  username: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().trim().min(1).max(2048)
});

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: false
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'password-strength-microservice',
    requestId: randomUUID()
  }));

  app.post('/api/v1/password-strength', async (request, reply) => {
    const parsed = passwordStrengthRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parsed.error.flatten().fieldErrors
      });
    }

    const result = evaluatePasswordStrength(parsed.data);

    return reply.code(200).send({
      score: result.score,
      label: result.label,
      feedback: result.feedback,
      checks: result.checks,
      passwordLength: parsed.data.password.length
    });
  });

  return app;
}

export async function startServer() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ host: '0.0.0.0', port });
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  void startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
