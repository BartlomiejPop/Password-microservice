import { describe, expect, it } from 'vitest';
import { buildApp } from '../../app.js';

describe('Password Strength Routes', () => {
  it('POST /passwordStrength with valid payload returns score and label', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/passwordStrength',
      payload: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({
      score: expect.any(Number),
      label: expect.any(String),
      feedback: expect.any(Array),
      checks: expect.any(Object),
      passwordLength: 14
    });
  });

  it('POST /passwordStrength with missing fields returns 400', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/passwordStrength',
      payload: {
        username: 'testuser'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toMatchObject({
      error: 'invalid_request',
      details: expect.any(Object)
    });
  });

  it('POST /passwordStrength with invalid email returns 400', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/passwordStrength',
      payload: {
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error).toBe('invalid_request');
  });

  it('POST /passwordStrength with weak password returns low score', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/passwordStrength',
      payload: {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.score).toBeLessThan(50);
  });
});
