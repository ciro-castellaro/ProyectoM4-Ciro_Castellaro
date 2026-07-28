import type { TaskSummary } from "../../types/email";
import type { Result } from "../../types/result";

// Implementación placeholder: todavía no existe la Vercel Function (se crea en
// la etapa siguiente) ni el envío real por AWS SES (dos etapas después). La
// firma ya respeta el contrato definido (idToken + TaskSummary), así que
// conectar el fetch real más adelante no debería requerir tocar los
// componentes que ya usan esta función.
export async function sendSummaryEmail(
  idToken: string,
  summary: TaskSummary,
): Promise<Result<{ message: string }>> {
  if (!idToken) {
    return { ok: false, error: "Tenés que iniciar sesión para enviar el resumen." };
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    ok: true,
    value: {
      message: `Resumen simulado: ${summary.total} tareas (${summary.pending} pendientes, ${summary.completed} completadas).`,
    },
  };
}
