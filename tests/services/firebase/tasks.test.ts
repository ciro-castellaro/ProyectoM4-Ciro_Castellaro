import { describe, it, expect, vi, beforeEach } from "vitest";
import { addDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { createTask } from "../../../src/services/firebase/tasks";

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    addDoc: vi.fn(),
  };
});

describe("createTask", () => {
  beforeEach(() => {
    vi.mocked(addDoc).mockReset();
  });

  it("crea la tarea en Firestore y devuelve el Task con el id asignado por el servidor", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "doc-123" } as never);

    const result = await createTask("user-1", {
      title: "Comprar leche",
      description: "1 litro",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("doc-123");
      expect(result.value.userId).toBe("user-1");
      expect(result.value.title).toBe("Comprar leche");
      expect(result.value.description).toBe("1 litro");
      expect(result.value.completed).toBe(false);
    }
  });

  it("le pasa a Firestore los campos mínimos que exigen las reglas de seguridad", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "doc-123" } as never);

    await createTask("user-1", { title: "Comprar leche", description: "" });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-1",
        title: "Comprar leche",
        completed: false,
      }),
    );
  });

  it("devuelve un error comprensible si Firestore rechaza la escritura", async () => {
    vi.mocked(addDoc).mockRejectedValue(
      new FirebaseError("permission-denied", "msg"),
    );

    const result = await createTask("user-1", {
      title: "Comprar leche",
      description: "",
    });

    expect(result).toEqual({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });
  });
});
