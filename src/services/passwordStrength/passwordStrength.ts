import zxcvbn from 'zxcvbn';
import type { PasswordStrengthInput, PasswordStrengthResult, PasswordStrengthLabel } from './passwordStrength.types.js';

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'letmein',
  'welcome',
  'admin',
  'secret',
  'iloveyou'
]);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function hasRepeatedCharacters(password: string): boolean {
  for (let index = 0; index < password.length - 2; index += 1) {
    if (password[index] === password[index + 1] && password[index] === password[index + 2]) {
      return true;
    }
  }

  return false;
}

function containsUserInfo(password: string, username: string, email: string): boolean {
  const normalizedPassword = normalize(password);
  const usernameTokens = username.split(/[^a-z0-9]+/).filter(Boolean);
  const emailLocalPart = email.split('@')[0] ?? '';
  const emailTokens = emailLocalPart.split(/[^a-z0-9]+/).filter(Boolean);

  const tokens = new Set([username, ...usernameTokens, emailLocalPart, ...emailTokens]);

  return Array.from(tokens).some((token) => token.length >= 3 && normalizedPassword.includes(token));
}

function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(normalize(password));
}

export function evaluatePasswordStrength(input: PasswordStrengthInput): PasswordStrengthResult {
  const password = input.password ?? '';
  const username = input.username ?? '';
  const email = input.email ?? '';
  const normalizedUsername = normalize(username);
  const normalizedEmail = normalize(email);
  const zxcvbnResult = zxcvbn(password, [normalizedUsername, normalizedEmail, username, email]);

  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^\w\s]/.test(password),
    notCommon: !isCommonPassword(password) && !containsUserInfo(password, normalizedUsername, normalizedEmail)
  };

  let score = zxcvbnResult.score * 16;

  if (password.length >= 16) {
    score += 8;
  } else if (password.length >= 12) {
    score += 6;
  } else if (password.length >= 8) {
    score += 3;
  }

  if (checks.uppercase) {
    score += 2;
  }
  if (checks.lowercase) {
    score += 2;
  }
  if (checks.number) {
    score += 2;
  }
  if (checks.symbol) {
    score += 2;
  }

  if (checks.notCommon) {
    score += 5;
  }

  if (containsUserInfo(password, normalizedUsername, normalizedEmail)) {
    score -= 16;
  }
  if (isCommonPassword(password)) {
    score -= 15;
  }
  if (hasRepeatedCharacters(password)) {
    score -= 4;
  }

  score = Math.max(0, Math.min(100, score));

  const feedback: string[] = [];
  if (zxcvbnResult.feedback.warning) {
    feedback.push(zxcvbnResult.feedback.warning);
  }
  for (const suggestion of zxcvbnResult.feedback.suggestions) {
    if (suggestion) {
      feedback.push(suggestion);
    }
  }
  if (password.length < 8) {
    feedback.push('Use at least 8 characters.');
  }
  if (!checks.uppercase) {
    feedback.push('Add at least one uppercase letter.');
  }
  if (!checks.lowercase) {
    feedback.push('Add at least one lowercase letter.');
  }
  if (!checks.number) {
    feedback.push('Add at least one number.');
  }
  if (!checks.symbol) {
    feedback.push('Add at least one symbol.');
  }
  if (containsUserInfo(password, normalizedUsername, normalizedEmail)) {
    feedback.push('Avoid using your username or email in the password.');
  }
  if (isCommonPassword(password)) {
    feedback.push('Avoid common passwords and predictable patterns.');
  }
  if (hasRepeatedCharacters(password)) {
    feedback.push('Avoid repeated character sequences.');
  }

  const uniqueFeedback = feedback.filter((item, index) => feedback.indexOf(item) === index);

  let label: PasswordStrengthLabel = 'very-weak';
  if (score >= 90) {
    label = 'very-strong';
  } else if (score >= 80) {
    label = 'strong';
  } else if (score >= 65) {
    label = 'good';
  } else if (score >= 50) {
    label = 'fair';
  } else if (score >= 30) {
    label = 'weak';
  }

  return {
    score,
    label,
    feedback: uniqueFeedback,
    checks
  };
}
