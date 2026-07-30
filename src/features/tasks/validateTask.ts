import type { Result } from "../../types/result";

export const TASK_TITLE_MAX_LENGTH = 100;
export const TASK_DESCRIPTION_MAX_LENGTH = 500;

export function validateTaskTitle(title: string): Result<string> {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "El título es obligatorio." };
  }

  if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `El título no puede superar los ${TASK_TITLE_MAX_LENGTH} caracteres.`,
    };
  }

  return { ok: true, value: trimmed };
}

export function validateTaskDescription(description: string): Result<string> {
  const trimmed = description.trim();

  if (trimmed.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      error: `La descripción no puede superar los ${TASK_DESCRIPTION_MAX_LENGTH} caracteres.`,
    };
  }

  return { ok: true, value: trimmed };
}

const DUE_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Devuelve la fecha como string "YYYY-MM-DD" (o null si vino vacía). Nunca
// arma un `Date` a partir del string para no reintroducir el corrimiento de
// un día por zona horaria; el `Date` que usa acá es solo para chequear que
// la fecha exista de verdad (ej: rechazar 2026-02-30), no para guardarla.
export function validateDueDate(dueDate: string): Result<string | null> {
  const trimmed = dueDate.trim();

  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }

  if (!DUE_DATE_REGEX.test(trimmed)) {
    return { ok: false, error: "La fecha de vencimiento no es válida." };
  }

  const [year, month, day] = trimmed.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  const isRealDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  if (!isRealDate) {
    return { ok: false, error: "La fecha de vencimiento no es válida." };
  }

  return { ok: true, value: trimmed };
}
