import { describe, it, expect } from "vitest";
import {
  validateTaskTitle,
  validateTaskDescription,
  TASK_TITLE_MAX_LENGTH,
  TASK_DESCRIPTION_MAX_LENGTH,
} from "../../../src/features/tasks/validateTask";

describe("validateTaskTitle", () => {
  it("acepta un título válido y devuelve la versión sin espacios extra", () => {
    const result = validateTaskTitle("  Comprar leche  ");

    expect(result).toEqual({ ok: true, value: "Comprar leche" });
  });

  it("rechaza un título vacío", () => {
    const result = validateTaskTitle("");

    expect(result.ok).toBe(false);
  });

  it("rechaza un título que solo tiene espacios", () => {
    const result = validateTaskTitle("   ");

    expect(result.ok).toBe(false);
  });

  it("rechaza un título que supera el máximo de caracteres", () => {
    const tituloLargo = "a".repeat(TASK_TITLE_MAX_LENGTH + 1);

    const result = validateTaskTitle(tituloLargo);

    expect(result.ok).toBe(false);
  });

  it("acepta un título que llega justo al máximo de caracteres", () => {
    const tituloLimite = "a".repeat(TASK_TITLE_MAX_LENGTH);

    const result = validateTaskTitle(tituloLimite);

    expect(result.ok).toBe(true);
  });
});

describe("validateTaskDescription", () => {
  it("acepta una descripción vacía", () => {
    const result = validateTaskDescription("");

    expect(result).toEqual({ ok: true, value: "" });
  });

  it("acepta una descripción válida y recorta espacios extra", () => {
    const result = validateTaskDescription("  Leche descremada, 1 litro  ");

    expect(result).toEqual({ ok: true, value: "Leche descremada, 1 litro" });
  });

  it("rechaza una descripción que supera el máximo de caracteres", () => {
    const descripcionLarga = "a".repeat(TASK_DESCRIPTION_MAX_LENGTH + 1);

    const result = validateTaskDescription(descripcionLarga);

    expect(result.ok).toBe(false);
  });
});
