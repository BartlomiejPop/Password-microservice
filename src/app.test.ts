import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

describe('HTTP routes', () => {
  it('serves the health endpoint', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      service: 'password-strength-microservice'
    });
  });

  it('accepts password strength requests', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/passwordStrength',
      payload: {
        username: 'okenobi',
        email: 'o.kenobi@jedi-council.com',
        password: 'JediMaster42!'
      }
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body).toMatchObject({
      label: 'good'
    });
    expect(body.passwordLength).toBeGreaterThan(0);
  });
});
