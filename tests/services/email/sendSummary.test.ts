import { describe, it, expect } from "vitest";
import { sendSummaryEmail } from "../../../src/services/email/sendSummary";
import type { TaskSummary } from "../../../src/types/email";

const summary: TaskSummary = {
  total: 3,
  pending: 2,
  completed: 1,
  pendingTitles: ["Comprar leche", "Lavar el auto"],
  completedTitles: ["Pagar el alquiler"],
};

describe("sendSummaryEmail (placeholder)", () => {
  it("devuelve éxito simulado cuando hay un idToken", async () => {
    const result = await sendSummaryEmail("fake-id-token", summary);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message).toContain("3 tareas");
    }
  });

  it("devuelve error si no hay idToken", async () => {
    const result = await sendSummaryEmail("", summary);

    expect(result).toEqual({
      ok: false,
      error: "Tenés que iniciar sesión para enviar el resumen.",
    });
  });
});
