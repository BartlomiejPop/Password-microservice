import { describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';

describe('Health Routes', () => {
  it('GET /health returns ok status', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({
      status: 'ok',
      service: 'password-strength-microservice'
    });
    expect(body.requestId).toBeDefined();
  });

  it('GET /health generates a unique requestId each time', async () => {
    const app = buildApp();

    const response1 = await app.inject({
      method: 'GET',
      url: '/health'
    });

    const response2 = await app.inject({
      method: 'GET',
      url: '/health'
    });

    const body1 = response1.json();
    const body2 = response2.json();

    expect(body1.requestId).not.toEqual(body2.requestId);
  });
});
