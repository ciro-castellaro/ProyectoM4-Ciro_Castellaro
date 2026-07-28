import { describe, it, expect } from "vitest";
import { buildEmailContent } from "../../server/buildEmailContent.js";
import type { TaskSummary } from "../../src/types/email.js";

describe("buildEmailContent", () => {
  it("incluye los contadores y el email destinatario", () => {
    const summary: TaskSummary = {
      total: 3,
      pending: 2,
      completed: 1,
      pendingTitles: ["Comprar leche", "Lavar el auto"],
      completedTitles: ["Pagar el alquiler"],
    };

    const content = buildEmailContent("usuario@matecode.com", summary);

    expect(content.subject).toContain("3 en total");
    expect(content.text).toContain("Total: 3");
    expect(content.text).toContain("Pendientes: 2");
    expect(content.text).toContain("Completadas: 1");
    expect(content.text).toContain("Comprar leche");
    expect(content.text).toContain("Lavar el auto");
    expect(content.text).toContain("Pagar el alquiler");
    expect(content.text).toContain("usuario@matecode.com");
  });

  it("no incluye las secciones de detalle si no hay tareas de ese tipo", () => {
    const summary: TaskSummary = {
      total: 0,
      pending: 0,
      completed: 0,
      pendingTitles: [],
      completedTitles: [],
    };

    const content = buildEmailContent("usuario@matecode.com", summary);
    const lines = content.text.split("\n");

    // Los contadores ("- Pendientes: 0") sí aparecen siempre; lo que no debe
    // aparecer es el encabezado de detalle ("Pendientes:" solo, sin guion ni
    // número), que solo se agrega cuando hay títulos para listar.
    expect(lines).not.toContain("Pendientes:");
    expect(lines).not.toContain("Completadas:");
  });
});
