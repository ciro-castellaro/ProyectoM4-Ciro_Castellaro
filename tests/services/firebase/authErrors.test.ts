import { describe, it, expect } from "vitest";
import { FirebaseError } from "firebase/app";
import { getAuthErrorMessage } from "../../../src/services/firebase/authErrors";

describe("getAuthErrorMessage", () => {
  it("devuelve un mensaje específico para email ya registrado", () => {
    const error = new FirebaseError("auth/email-already-in-use", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "Ya existe una cuenta registrada con este email.",
    );
  });

  it("devuelve el mismo mensaje genérico para credenciales inválidas, usuario no encontrado y contraseña incorrecta", () => {
    const codes = [
      "auth/invalid-credential",
      "auth/user-not-found",
      "auth/wrong-password",
    ];

    const messages = codes.map((code) =>
      getAuthErrorMessage(new FirebaseError(code, "msg")),
    );

    expect(new Set(messages).size).toBe(1);
  });

  it("devuelve un mensaje específico cuando el proveedor de email/contraseña no está habilitado", () => {
    const error = new FirebaseError("auth/operation-not-allowed", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "El inicio de sesión por email y contraseña no está habilitado para este proyecto.",
    );
  });

  it("devuelve un mensaje específico para contraseña débil", () => {
    const error = new FirebaseError("auth/weak-password", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "La contraseña debe tener al menos 6 caracteres.",
    );
  });

  it("devuelve un mensaje específico para email con formato inválido", () => {
    const error = new FirebaseError("auth/invalid-email", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "El email no tiene un formato válido.",
    );
  });

  it("devuelve un mensaje específico para una cuenta deshabilitada", () => {
    const error = new FirebaseError("auth/user-disabled", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "Esta cuenta fue deshabilitada.",
    );
  });

  it("devuelve un mensaje específico cuando se alcanza el límite de intentos", () => {
    const error = new FirebaseError("auth/too-many-requests", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
    );
  });

  it("devuelve un mensaje específico cuando falla la conexión", () => {
    const error = new FirebaseError("auth/network-request-failed", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "Error de conexión. Revisá tu internet e intentá de nuevo.",
    );
  });

  it("devuelve un mensaje por defecto para un código de Firebase desconocido", () => {
    const error = new FirebaseError("auth/some-new-error-code", "msg");

    expect(getAuthErrorMessage(error)).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });

  it("devuelve un mensaje por defecto si el error no es un FirebaseError", () => {
    expect(getAuthErrorMessage(new Error("algo raro"))).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });
});
