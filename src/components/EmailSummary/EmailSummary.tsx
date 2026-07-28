import { useEffect, useState } from "react";
import type { TaskSummary } from "../../types/email";
import type { Result } from "../../types/result";
import "./EmailSummary.css";

interface EmailSummaryProps {
  summary: TaskSummary;
  onSend: () => Promise<Result<{ message: string }>>;
}

function EmailSummary({ summary, onSend }: EmailSummaryProps) {
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  // Si cambian los contadores (porque se creó/editó/eliminó una tarea en
  // otra sección de la pantalla), el feedback del envío anterior queda
  // desactualizado: se limpia para no mostrar un mensaje que ya no aplica.
  useEffect(() => {
    setFeedback(null);
  }, [summary.total, summary.pending, summary.completed]);

  async function handleClick() {
    setIsSending(true);
    setFeedback(null);
    const result = await onSend();
    setIsSending(false);

    setFeedback(
      result.ok
        ? { type: "success", message: "✓ Te enviamos un resumen a tu email." }
        : { type: "error", message: result.error },
    );
  }

  return (
    <section className="email-summary card">
      <h2>Resumen por email</h2>
      <p className="email-summary-description">
        Te enviaremos un email con el total de tareas, cuántas están
        pendientes, cuántas completadas, y el detalle de cada una (
        {summary.total} en total: {summary.pending} pendiente
        {summary.pending === 1 ? "" : "s"}, {summary.completed} completada
        {summary.completed === 1 ? "" : "s"}).
      </p>

      <button
        type="button"
        className="primary"
        onClick={handleClick}
        disabled={isSending}
      >
        {isSending ? "Enviando..." : "Enviar resumen por email"}
      </button>

      {feedback && (
        <p
          className={feedback.type === "error" ? "field-error" : "email-summary-success"}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.type === "error" ? `⚠ ${feedback.message}` : feedback.message}
        </p>
      )}
    </section>
  );
}

export default EmailSummary;
