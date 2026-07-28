import type { TaskSummary } from "../src/types/email.js";

export interface EmailContent {
  subject: string;
  text: string;
}

export function buildEmailContent(
  email: string,
  summary: TaskSummary,
): EmailContent {
  const subject = `Resumen de tus tareas en MateCode (${summary.total} en total)`;

  const lines = [
    "Hola,",
    "",
    "Este es el resumen de tus tareas en MateCode:",
    `- Total: ${summary.total}`,
    `- Pendientes: ${summary.pending}`,
    `- Completadas: ${summary.completed}`,
  ];

  if (summary.pendingTitles.length > 0) {
    lines.push("", "Pendientes:", ...summary.pendingTitles.map((title) => `- ${title}`));
  }

  if (summary.completedTitles.length > 0) {
    lines.push("", "Completadas:", ...summary.completedTitles.map((title) => `- ${title}`));
  }

  lines.push(
    "",
    `Este email se envió a ${email} porque lo pediste desde MateCode Task Manager.`,
  );

  return { subject, text: lines.join("\n") };
}
