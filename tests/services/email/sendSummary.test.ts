import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendSummaryEmail } from "../../../src/services/email/sendSummary";
import type { TaskSummary } from "../../../src/types/email";

const summary: TaskSummary = {
  total: 3,
  pending: 2,
  completed: 1,
  pendingTitles: ["Comprar leche", "Lavar el auto"],
  completedTitles: ["Pagar el alquiler"],
};

describe("sendSummaryEmail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no llama al servidor y devuelve error si no hay idToken", async () => {
    const result = await sendSummaryEmail("", summary);

    expect(result).toEqual({
      ok: false,
      error: "Tenés que iniciar sesión para enviar el resumen.",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("llama a /api/send-summary con el idToken y el resumen, y devuelve la respuesta", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({ ok: true, value: { message: "Resumen enviado." } }),
    } as Response);

    const result = await sendSummaryEmail("fake-id-token", summary);

    expect(fetch).toHaveBeenCalledWith("/api/send-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "fake-id-token", summary }),
    });
    expect(result).toEqual({ ok: true, value: { message: "Resumen enviado." } });
  });

  it("propaga un error devuelto por el servidor", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({ ok: false, error: "El token de autenticación es inválido o expiró." }),
    } as Response);

    const result = await sendSummaryEmail("fake-id-token", summary);

    expect(result).toEqual({
      ok: false,
      error: "El token de autenticación es inválido o expiró.",
    });
  });

  it("devuelve un error genérico si falla la conexión", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const result = await sendSummaryEmail("fake-id-token", summary);

    expect(result).toEqual({
      ok: false,
      error: "No se pudo conectar con el servicio de email.",
    });
  });
});
