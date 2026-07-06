import zxcvbn from 'zxcvbn';
import type { PasswordStrengthInput, PasswordStrengthResult, PasswordStrengthLabel } from './passwordStrength.types.js';

const ZXCVM_SCORE_MULTIPLIER = 16;
const SCORE_MIN = 0;
const SCORE_MAX = 100;
const MIN_PASSWORD_LENGTH = 8;
const RECOMMENDED_PASSWORD_LENGTH = 12;
const STRONG_PASSWORD_LENGTH = 16;
const REPEATED_SEQUENCE_LENGTH = 3;
const MIN_USER_INFO_TOKEN_LENGTH = 3;
const UPPERCASE_SCORE = 2;
const LOWERCASE_SCORE = 2;
const NUMBER_SCORE = 2;
const SYMBOL_SCORE = 2;
const NOT_COMMON_SCORE = 5;
const USER_INFO_PENALTY = 16;
const COMMON_PASSWORD_PENALTY = 15;
const REPEATED_CHARACTERS_PENALTY = 4;
const LABEL_THRESHOLD_VERY_STRONG = 90;
const LABEL_THRESHOLD_STRONG = 80;
const LABEL_THRESHOLD_GOOD = 65;
const LABEL_THRESHOLD_FAIR = 50;
const LABEL_THRESHOLD_WEAK = 30;

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
  for (let index = 0; index < password.length - REPEATED_SEQUENCE_LENGTH + 1; index += 1) {
    if (
      password[index] === password[index + 1] &&
      password[index] === password[index + 2]
    ) {
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

  return Array.from(tokens).some(
    (token) => token.length >= MIN_USER_INFO_TOKEN_LENGTH && normalizedPassword.includes(token)
  );
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
    length: password.length >= RECOMMENDED_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^\w\s]/.test(password),
    notCommon: !isCommonPassword(password) && !containsUserInfo(password, normalizedUsername, normalizedEmail)
  };

  let score = zxcvbnResult.score * ZXCVM_SCORE_MULTIPLIER;

  if (password.length >= STRONG_PASSWORD_LENGTH) {
    score += 8;
  } else if (password.length >= RECOMMENDED_PASSWORD_LENGTH) {
    score += 6;
  } else if (password.length >= MIN_PASSWORD_LENGTH) {
    score += 3;
  }

  if (checks.uppercase) {
    score += UPPERCASE_SCORE;
  }
  if (checks.lowercase) {
    score += LOWERCASE_SCORE;
  }
  if (checks.number) {
    score += NUMBER_SCORE;
  }
  if (checks.symbol) {
    score += SYMBOL_SCORE;
  }

  if (checks.notCommon) {
    score += NOT_COMMON_SCORE;
  }

  if (containsUserInfo(password, normalizedUsername, normalizedEmail)) {
    score -= USER_INFO_PENALTY;
  }
  if (isCommonPassword(password)) {
    score -= COMMON_PASSWORD_PENALTY;
  }
  if (hasRepeatedCharacters(password)) {
    score -= REPEATED_CHARACTERS_PENALTY;
  }

  score = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));

  const feedback: string[] = [];
  if (zxcvbnResult.feedback.warning) {
    feedback.push(zxcvbnResult.feedback.warning);
  }
  for (const suggestion of zxcvbnResult.feedback.suggestions) {
    if (suggestion) {
      feedback.push(suggestion);
    }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    feedback.push(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
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
  if (score >= LABEL_THRESHOLD_VERY_STRONG) {
    label = 'very-strong';
  } else if (score >= LABEL_THRESHOLD_STRONG) {
    label = 'strong';
  } else if (score >= LABEL_THRESHOLD_GOOD) {
    label = 'good';
  } else if (score >= LABEL_THRESHOLD_FAIR) {
    label = 'fair';
  } else if (score >= LABEL_THRESHOLD_WEAK) {
    label = 'weak';
  }

  return {
    score,
    label,
    feedback: uniqueFeedback,
    checks
  };
}
