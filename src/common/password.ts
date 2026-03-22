export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  specialChars: string;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 64,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: false,
  specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`密码长度至少 ${policy.minLength} 位`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`密码长度不能超过 ${policy.maxLength} 位`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("密码必须包含大写字母");
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("密码必须包含小写字母");
  }

  if (policy.requireDigit && !/[0-9]/.test(password)) {
    errors.push("密码必须包含数字");
  }

  if (policy.requireSpecial) {
    const hasSpecial = policy.specialChars
      .split("")
      .some((char) => password.includes(char));
    if (!hasSpecial) {
      errors.push(`密码必须包含特殊字符：${policy.specialChars}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function checkPasswordStrength(
  password: string,
): "weak" | "medium" | "strong" {
  let score = 0;

  if (password.length >= 8) {
    score++;
  }
  if (password.length >= 12) {
    score++;
  }
  if (/[a-z]/.test(password)) {
    score++;
  }
  if (/[A-Z]/.test(password)) {
    score++;
  }
  if (/[0-9]/.test(password)) {
    score++;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }

  if (score <= 2) {
    return "weak";
  }
  if (score <= 4) {
    return "medium";
  }
  return "strong";
}
