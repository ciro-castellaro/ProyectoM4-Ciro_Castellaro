import type { TaskSummary, SendSummaryRequest, SendSummaryResponse } from "../../types/email";
import type { Result } from "../../types/result";

export async function sendSummaryEmail(
  idToken: string,
  summary: TaskSummary,
): Promise<Result<{ message: string }>> {
  if (!idToken) {
    return { ok: false, error: "Tenés que iniciar sesión para enviar el resumen." };
  }

  try {
    const response = await fetch("/api/send-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, summary } satisfies SendSummaryRequest),
    });

    return (await response.json()) as SendSummaryResponse;
  } catch {
    return { ok: false, error: "No se pudo conectar con el servicio de email." };
  }
}
