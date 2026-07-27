import { describe, it, expect, vi, beforeEach } from "vitest";
import { addDoc, getDocs, Timestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { createTask, getUserTasks } from "../../../src/services/firebase/tasks";

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    addDoc: vi.fn(),
    getDocs: vi.fn(),
  };
});

function createFakeQueryDocSnapshot(
  id: string,
  data: Record<string, unknown>,
) {
  return { id, data: () => data };
}

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

describe("getUserTasks", () => {
  beforeEach(() => {
    vi.mocked(getDocs).mockReset();
  });

  it("devuelve solo las tareas del usuario, ordenadas de más reciente a más antigua", async () => {
    const older = Timestamp.fromDate(new Date("2026-01-01T00:00:00.000Z"));
    const newer = Timestamp.fromDate(new Date("2026-01-05T00:00:00.000Z"));

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        createFakeQueryDocSnapshot("task-old", {
          userId: "user-1",
          title: "Tarea vieja",
          description: "",
          completed: false,
          createdAt: older,
          updatedAt: older,
        }),
        createFakeQueryDocSnapshot("task-new", {
          userId: "user-1",
          title: "Tarea nueva",
          description: "",
          completed: false,
          createdAt: newer,
          updatedAt: newer,
        }),
      ],
    } as never);

    const result = await getUserTasks("user-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((t) => t.title)).toEqual([
        "Tarea nueva",
        "Tarea vieja",
      ]);
    }
  });

  it("devuelve un error comprensible si Firestore rechaza la consulta", async () => {
    vi.mocked(getDocs).mockRejectedValue(
      new FirebaseError("permission-denied", "msg"),
    );

    const result = await getUserTasks("user-1");

    expect(result).toEqual({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });
  });
});
