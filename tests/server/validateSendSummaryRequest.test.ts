import { describe, it, expect } from "vitest";
import { validateSendSummaryRequest } from "../../server/validateSendSummaryRequest";

const validSummary = {
  total: 2,
  pending: 1,
  completed: 1,
  pendingTitles: ["Comprar leche"],
  completedTitles: ["Pagar el alquiler"],
};

describe("validateSendSummaryRequest", () => {
  it("acepta un cuerpo válido", () => {
    const result = validateSendSummaryRequest({
      idToken: "token-123",
      summary: validSummary,
    });

    expect(result).toEqual({
      ok: true,
      value: { idToken: "token-123", summary: validSummary },
    });
  });

  it("rechaza un cuerpo que no es un objeto", () => {
    expect(validateSendSummaryRequest(null)).toEqual({
      ok: false,
      error: "El cuerpo de la solicitud es inválido.",
    });
    expect(validateSendSummaryRequest("texto")).toEqual({
      ok: false,
      error: "El cuerpo de la solicitud es inválido.",
    });
  });

  it("rechaza si falta o está vacío el idToken", () => {
    expect(
      validateSendSummaryRequest({ summary: validSummary }),
    ).toEqual({ ok: false, error: "Falta el token de autenticación." });

    expect(
      validateSendSummaryRequest({ idToken: "   ", summary: validSummary }),
    ).toEqual({ ok: false, error: "Falta el token de autenticación." });
  });

  it("rechaza si el resumen tiene campos con tipo incorrecto", () => {
    const result = validateSendSummaryRequest({
      idToken: "token-123",
      summary: { ...validSummary, total: "2" },
    });

    expect(result).toEqual({
      ok: false,
      error: "El resumen de tareas tiene un formato inválido.",
    });
  });

  it("rechaza si las listas de títulos no son arrays de strings", () => {
    const result = validateSendSummaryRequest({
      idToken: "token-123",
      summary: { ...validSummary, pendingTitles: [1, 2, 3] },
    });

    expect(result).toEqual({
      ok: false,
      error: "El resumen de tareas tiene un formato inválido.",
    });
  });
});
