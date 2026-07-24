import type { Result } from '../../types/result'

export const TASK_TITLE_MAX_LENGTH = 100
export const TASK_DESCRIPTION_MAX_LENGTH = 500

export function validateTaskTitle(title: string): Result<string> {
  const trimmed = title.trim()

  if (trimmed.length === 0) {
    return { ok: false, error: 'El título es obligatorio.' }
  }

  if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `El título no puede superar los ${TASK_TITLE_MAX_LENGTH} caracteres.`,
    }
  }

  return { ok: true, value: trimmed }
}

export function validateTaskDescription(description: string): Result<string> {
  const trimmed = description.trim()

  if (trimmed.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      error: `La descripción no puede superar los ${TASK_DESCRIPTION_MAX_LENGTH} caracteres.`,
    }
  }

  return { ok: true, value: trimmed }
}
