import { describe, expect, it } from 'vitest';
import { evaluatePasswordStrength } from './passwordStrength.js';

describe('evaluatePasswordStrength', () => {
  it('returns a good score for a long password with varied character classes', () => {
    const result = evaluatePasswordStrength({
      username: 'okenobi',
      email: 'o.kenobi@jedi-council.com',
      password: 'JediMaster42!'
    });

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.label).toBe('good');
    expect(result.checks.length).toBe(true);
    expect(result.checks.uppercase).toBe(true);
    expect(result.checks.lowercase).toBe(true);
    expect(result.checks.number).toBe(true);
    expect(result.checks.symbol).toBe(true);
  });

  it('penalizes passwords that reuse the username or email', () => {
    const result = evaluatePasswordStrength({
      username: 'okenobi',
      email: 'o.kenobi@jedi-council.com',
      password: 'okenobi123'
    });

    expect(result.score).toBeLessThan(55);
    expect(result.feedback.some((item) => item.includes('username'))).toBe(true);
  });

  it('returns a low score and actionable feedback for very weak passwords', () => {
    const result = evaluatePasswordStrength({
      username: 'okenobi',
      email: 'o.kenobi@jedi-council.com',
      password: 'password'
    });

    expect(result.score).toBeLessThan(40);
    expect(result.feedback.length).toBeGreaterThan(0);
    expect(result.label).toBe('very-weak');
  });

  it('uses zxcvbn-style scoring for predictable passwords', () => {
    const result = evaluatePasswordStrength({
      username: 'okenobi',
      email: 'o.kenobi@jedi-council.com',
      password: 'Password1'
    });

    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe('very-weak');
  });
});
