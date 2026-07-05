import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { evaluatePasswordStrength } from '../../services/passwordStrength/passwordStrength.js';

const passwordStrengthRequestSchema = z.object({
  username: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().trim().min(1).max(2048)
});

export async function passwordStrengthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/passwordStrength', async (request, reply) => {
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
}
