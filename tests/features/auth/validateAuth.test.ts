import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  PASSWORD_MIN_LENGTH,
} from "../../../src/features/auth/validateAuth";

describe("validateEmail", () => {
  it("acepta un email válido y devuelve la versión sin espacios extra", () => {
    const result = validateEmail("  usuario@matecode.com  ");

    expect(result).toEqual({ ok: true, value: "usuario@matecode.com" });
  });

  it("rechaza un email vacío", () => {
    expect(validateEmail("").ok).toBe(false);
  });

  it("rechaza un email sin arroba", () => {
    expect(validateEmail("usuario.matecode.com").ok).toBe(false);
  });

  it("rechaza un email sin dominio", () => {
    expect(validateEmail("usuario@matecode").ok).toBe(false);
  });
});

describe("validatePassword", () => {
  it("acepta una contraseña con el largo mínimo", () => {
    const password = "a".repeat(PASSWORD_MIN_LENGTH);

    expect(validatePassword(password)).toEqual({ ok: true, value: password });
  });

  it("rechaza una contraseña vacía", () => {
    expect(validatePassword("").ok).toBe(false);
  });

  it("rechaza una contraseña más corta que el mínimo", () => {
    const password = "a".repeat(PASSWORD_MIN_LENGTH - 1);

    expect(validatePassword(password).ok).toBe(false);
  });
});
