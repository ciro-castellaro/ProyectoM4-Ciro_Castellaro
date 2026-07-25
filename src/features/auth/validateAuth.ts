import type { Result } from "../../types/result";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;

export function validateEmail(email: string): Result<string> {
  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "El email es obligatorio." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { ok: false, error: "El email no tiene un formato válido." };
  }

  return { ok: true, value: trimmed };
}

export function validatePassword(password: string): Result<string> {
  if (password.length === 0) {
    return { ok: false, error: "La contraseña es obligatoria." };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    };
  }

  return { ok: true, value: password };
}
