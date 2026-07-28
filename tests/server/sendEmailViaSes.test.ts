import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn().mockImplementation(function SESClient() {
    return { send: mockSend };
  }),
  SendEmailCommand: vi.fn().mockImplementation(function SendEmailCommand(
    input: unknown,
  ) {
    return input;
  }),
}));

import { sendEmailViaSes } from "../../server/sendEmailViaSes.js";
import type { EmailContent } from "../../server/buildEmailContent.js";

const content: EmailContent = {
  subject: "Resumen de tus tareas en MateCode (2 en total)",
  text: "Hola,\n\nEste es el resumen...",
};

describe("sendEmailViaSes", () => {
  beforeEach(() => {
    mockSend.mockReset();
    vi.stubEnv("SES_SENDER_EMAIL", "no-reply@matecode.com");
    vi.stubEnv("SES_REGION", "us-east-1");
    vi.stubEnv("SES_ACCESS_KEY_ID", "fake-access-key");
    vi.stubEnv("SES_SECRET_ACCESS_KEY", "fake-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("envía el email con el remitente configurado y devuelve un mensaje de éxito", async () => {
    mockSend.mockResolvedValue({ MessageId: "msg-123" });

    const result = await sendEmailViaSes("usuario@matecode.com", content);

    expect(result).toEqual({
      ok: true,
      value: { message: "Resumen enviado a usuario@matecode.com." },
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        Source: "no-reply@matecode.com",
        Destination: { ToAddresses: ["usuario@matecode.com"] },
      }),
    );
  });

  it("devuelve un error de configuración si falta SES_SENDER_EMAIL", async () => {
    vi.stubEnv("SES_SENDER_EMAIL", "");

    const result = await sendEmailViaSes("usuario@matecode.com", content);

    expect(result).toEqual({
      ok: false,
      error: "El servicio de email no está configurado correctamente.",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("devuelve un error de configuración si falta SES_REGION", async () => {
    vi.stubEnv("SES_REGION", "");

    const result = await sendEmailViaSes("usuario@matecode.com", content);

    expect(result).toEqual({
      ok: false,
      error: "El servicio de email no está configurado correctamente.",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("mapea un error de SES a un mensaje comprensible, sin exponer el detalle interno", async () => {
    const sesError = new Error("Email address is not verified. (sandbox mode)");
    sesError.name = "MessageRejected";
    mockSend.mockRejectedValue(sesError);

    const result = await sendEmailViaSes("usuario@matecode.com", content);

    expect(result).toEqual({
      ok: false,
      error: "El servicio de email rechazó el envío. Verificá que el destinatario sea válido.",
    });
  });
});
