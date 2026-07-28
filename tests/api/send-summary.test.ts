import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../../api/send-summary.js";
import { verifyIdToken } from "../../server/verifyIdToken.js";
import { sendEmailViaSes } from "../../server/sendEmailViaSes.js";

vi.mock("../../server/verifyIdToken.js", () => ({
  verifyIdToken: vi.fn(),
}));

vi.mock("../../server/sendEmailViaSes.js", () => ({
  sendEmailViaSes: vi.fn(),
}));

const validSummary = {
  total: 2,
  pending: 1,
  completed: 1,
  pendingTitles: ["Comprar leche"],
  completedTitles: ["Pagar el alquiler"],
};

function createMockRes() {
  const res = {} as VercelResponse;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
}

function createMockReq(overrides: Partial<VercelRequest>): VercelRequest {
  return { method: "POST", body: {}, ...overrides } as VercelRequest;
}

describe("POST /api/send-summary", () => {
  beforeEach(() => {
    vi.mocked(verifyIdToken).mockReset();
    vi.mocked(sendEmailViaSes).mockReset();
  });

  it("responde 405 si el método no es POST", async () => {
    const req = createMockReq({ method: "GET" });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false }),
    );
  });

  it("responde 400 si falta el idToken", async () => {
    const req = createMockReq({ body: { summary: validSummary } });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("responde 400 si el resumen tiene forma inválida", async () => {
    const req = createMockReq({
      body: { idToken: "token", summary: { total: "no-es-numero" } },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responde 401 si el token es inválido o expiró", async () => {
    vi.mocked(verifyIdToken).mockResolvedValue({
      ok: false,
      error: "El token de autenticación es inválido o expiró.",
    });
    const req = createMockReq({
      body: { idToken: "bad-token", summary: validSummary },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("envía el email y responde 200 con el mensaje de éxito si todo es válido", async () => {
    vi.mocked(verifyIdToken).mockResolvedValue({
      ok: true,
      value: { uid: "user-1", email: "usuario@matecode.com" },
    });
    vi.mocked(sendEmailViaSes).mockResolvedValue({
      ok: true,
      value: { message: "Resumen enviado a usuario@matecode.com." },
    });
    const req = createMockReq({
      body: { idToken: "good-token", summary: validSummary },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(sendEmailViaSes).toHaveBeenCalledWith(
      "usuario@matecode.com",
      expect.objectContaining({ subject: expect.any(String) }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          message: expect.stringContaining("usuario@matecode.com"),
        }),
      }),
    );
  });

  it("responde 500 con un mensaje comprensible si falla el envío por SES", async () => {
    vi.mocked(verifyIdToken).mockResolvedValue({
      ok: true,
      value: { uid: "user-1", email: "usuario@matecode.com" },
    });
    vi.mocked(sendEmailViaSes).mockResolvedValue({
      ok: false,
      error: "No se pudo enviar el email. Intentá de nuevo más tarde.",
    });
    const req = createMockReq({
      body: { idToken: "good-token", summary: validSummary },
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "No se pudo enviar el email. Intentá de nuevo más tarde.",
    });
  });
});
