import type { Result } from "../src/types/result";
import type { SendSummaryRequest, TaskSummary } from "../src/types/email";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidSummary(value: unknown): value is TaskSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const summary = value as Record<string, unknown>;

  return (
    typeof summary.total === "number" &&
    typeof summary.pending === "number" &&
    typeof summary.completed === "number" &&
    isStringArray(summary.pendingTitles) &&
    isStringArray(summary.completedTitles)
  );
}

export function validateSendSummaryRequest(
  body: unknown,
): Result<SendSummaryRequest> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "El cuerpo de la solicitud es inválido." };
  }

  const { idToken, summary } = body as Record<string, unknown>;

  if (typeof idToken !== "string" || idToken.trim().length === 0) {
    return { ok: false, error: "Falta el token de autenticación." };
  }

  if (!isValidSummary(summary)) {
    return {
      ok: false,
      error: "El resumen de tareas tiene un formato inválido.",
    };
  }

  return { ok: true, value: { idToken, summary } };
}
