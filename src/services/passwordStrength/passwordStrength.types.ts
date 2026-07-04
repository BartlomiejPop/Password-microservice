export type PasswordStrengthLabel = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

export interface PasswordStrengthInput {
  username: string;
  email: string;
  password: string;
}

export interface PasswordStrengthResult {
  score: number;
  label: PasswordStrengthLabel;
  feedback: string[];
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
    notCommon: boolean;
  };
}