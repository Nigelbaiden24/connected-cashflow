import { z } from "zod";

export const PASSWORD_RULES = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

export const passwordSchema = z
  .string()
  .min(PASSWORD_RULES.minLength, `Password must be at least ${PASSWORD_RULES.minLength} characters`)
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must include at least one special character");

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 10) strength++;
  if (password.length >= 14) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
};

export const getPasswordStrengthLabel = (strength: number): string => {
  if (strength <= 2) return "Weak password";
  if (strength === 3) return "Medium strength";
  if (strength === 4) return "Strong password";
  return "Very strong password";
};

export const getPasswordRequirements = (password: string) => [
  { met: password.length >= 10, label: "At least 10 characters" },
  { met: /[A-Z]/.test(password), label: "One uppercase letter" },
  { met: /[a-z]/.test(password), label: "One lowercase letter" },
  { met: /[0-9]/.test(password), label: "One number" },
  { met: /[^a-zA-Z0-9]/.test(password), label: "One special character" },
];
