import { describe, it, expect } from "vitest";
import { getSesErrorMessage } from "../../server/sesErrors.js";

function makeError(name: string): Error {
  const error = new Error("detalle interno de AWS");
  error.name = name;
  return error;
}

describe("getSesErrorMessage", () => {
  it("mapea MessageRejected a un mensaje comprensible", () => {
    expect(getSesErrorMessage(makeError("MessageRejected"))).toBe(
      "El servicio de email rechazó el envío. Verificá que el destinatario sea válido.",
    );
  });

  it("mapea errores de configuración a un mensaje genérico de configuración", () => {
    expect(
      getSesErrorMessage(makeError("MailFromDomainNotVerifiedException")),
    ).toBe("El servicio de email no está configurado correctamente.");
    expect(
      getSesErrorMessage(makeError("ConfigurationSetDoesNotExistException")),
    ).toBe("El servicio de email no está configurado correctamente.");
  });

  it("mapea errores de envío pausado", () => {
    expect(getSesErrorMessage(makeError("AccountSendingPausedException"))).toBe(
      "El envío de emails está pausado temporalmente. Probá de nuevo más tarde.",
    );
  });

  it("mapea errores de throttling", () => {
    expect(getSesErrorMessage(makeError("ThrottlingException"))).toBe(
      "Se alcanzó el límite de envíos por ahora. Probá de nuevo en unos minutos.",
    );
  });

  it("devuelve un mensaje genérico para errores no contemplados, sin filtrar el detalle interno", () => {
    const message = getSesErrorMessage(makeError("AlgúnErrorNuevoDeAWS"));

    expect(message).toBe("No se pudo enviar el email. Intentá de nuevo más tarde.");
    expect(message).not.toContain("detalle interno de AWS");
  });

  it("devuelve el mensaje genérico si el error no es una instancia de Error", () => {
    expect(getSesErrorMessage("algo raro")).toBe(
      "No se pudo enviar el email. Intentá de nuevo más tarde.",
    );
  });
});
