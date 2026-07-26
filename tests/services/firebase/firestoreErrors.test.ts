import { describe, it, expect } from "vitest";
import { FirebaseError } from "firebase/app";
import { getFirestoreErrorMessage } from "../../../src/services/firebase/firestoreErrors";

describe("getFirestoreErrorMessage", () => {
  it("devuelve un mensaje específico para permiso denegado", () => {
    const error = new FirebaseError("permission-denied", "msg");

    expect(getFirestoreErrorMessage(error)).toBe(
      "No tenés permiso para realizar esta acción.",
    );
  });

  it("devuelve un mensaje específico para problemas de conexión", () => {
    const error = new FirebaseError("unavailable", "msg");

    expect(getFirestoreErrorMessage(error)).toBe(
      "No se pudo conectar con el servidor. Revisá tu internet e intentá de nuevo.",
    );
  });

  it("devuelve un mensaje por defecto para un código desconocido", () => {
    const error = new FirebaseError("some-new-error-code", "msg");

    expect(getFirestoreErrorMessage(error)).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });

  it("devuelve un mensaje por defecto si el error no es un FirebaseError", () => {
    expect(getFirestoreErrorMessage(new Error("algo raro"))).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });
});
