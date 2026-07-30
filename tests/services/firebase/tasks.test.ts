import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import {
  createTask,
  getUserTasks,
  updateTask,
  updateTasksOrder,
  deleteTask,
} from "../../../src/services/firebase/tasks";
import type { Task } from "../../../src/types/task";

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    writeBatch: vi.fn(),
  };
});

function makeTask(id: string): Task {
  return {
    id,
    userId: "user-1",
    title: `Tarea ${id}`,
    description: "",
    completed: false,
    priority: "medium",
    dueDate: null,
    order: 1,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
  };
}

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
      priority: "medium",
      dueDate: null,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("doc-123");
      expect(result.value.userId).toBe("user-1");
      expect(result.value.title).toBe("Comprar leche");
      expect(result.value.description).toBe("1 litro");
      expect(result.value.completed).toBe(false);
      expect(result.value.priority).toBe("medium");
      expect(result.value.dueDate).toBeNull();
    }
  });

  it("le pasa a Firestore los campos mínimos que exigen las reglas de seguridad", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "doc-123" } as never);

    await createTask("user-1", {
      title: "Comprar leche",
      description: "",
      priority: "medium",
      dueDate: null,
    });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-1",
        title: "Comprar leche",
        completed: false,
        priority: "medium",
      }),
    );
  });

  it("le pasa a Firestore la prioridad y la fecha de vencimiento elegidas", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "doc-123" } as never);

    await createTask("user-1", {
      title: "Comprar leche",
      description: "",
      priority: "high",
      dueDate: "2026-03-15",
    });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        priority: "high",
        dueDate: "2026-03-15",
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
      priority: "medium",
      dueDate: null,
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

describe("updateTask", () => {
  beforeEach(() => {
    vi.mocked(updateDoc).mockReset();
  });

  it("actualiza los campos indicados y siempre toca updatedAt", async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const result = await updateTask("task-1", { completed: true });

    expect(result).toEqual({ ok: true, value: undefined });
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ completed: true }),
    );
    const [, changes] = vi.mocked(updateDoc).mock.calls[0];
    expect(
      (changes as unknown as Record<string, unknown>).updatedAt,
    ).toBeInstanceOf(
      Timestamp,
    );
  });

  it("permite actualizar la prioridad y la fecha de vencimiento", async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const result = await updateTask("task-1", {
      priority: "high",
      dueDate: "2026-03-15",
    });

    expect(result).toEqual({ ok: true, value: undefined });
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ priority: "high", dueDate: "2026-03-15" }),
    );
  });

  it("devuelve un error comprensible si Firestore rechaza la actualización", async () => {
    vi.mocked(updateDoc).mockRejectedValue(
      new FirebaseError("permission-denied", "msg"),
    );

    const result = await updateTask("task-1", { completed: true });

    expect(result).toEqual({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });
  });
});

describe("updateTasksOrder", () => {
  beforeEach(() => {
    vi.mocked(writeBatch).mockReset();
  });

  it("reescribe el order de todas las tareas, de mayor a menor según su posición visual", async () => {
    const update = vi.fn();
    const commit = vi.fn().mockResolvedValue(undefined);
    vi.mocked(writeBatch).mockReturnValue({ update, commit } as never);

    const tasks = [makeTask("a"), makeTask("b"), makeTask("c")];
    const result = await updateTasksOrder(tasks);

    expect(result).toEqual({ ok: true, value: undefined });
    expect(update).toHaveBeenCalledTimes(3);

    const orders = update.mock.calls.map(
      ([, changes]) => (changes as { order: number }).order,
    );
    expect(orders[0]).toBeGreaterThan(orders[1]);
    expect(orders[1]).toBeGreaterThan(orders[2]);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("devuelve un error comprensible si Firestore rechaza el batch", async () => {
    const update = vi.fn();
    const commit = vi
      .fn()
      .mockRejectedValue(new FirebaseError("permission-denied", "msg"));
    vi.mocked(writeBatch).mockReturnValue({ update, commit } as never);

    const result = await updateTasksOrder([makeTask("a")]);

    expect(result).toEqual({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });
  });
});

describe("deleteTask", () => {
  beforeEach(() => {
    vi.mocked(deleteDoc).mockReset();
  });

  it("elimina el documento en Firestore", async () => {
    vi.mocked(deleteDoc).mockResolvedValue(undefined);

    const result = await deleteTask("task-1");

    expect(result).toEqual({ ok: true, value: undefined });
    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
  });

  it("devuelve un error comprensible si Firestore rechaza la eliminación", async () => {
    vi.mocked(deleteDoc).mockRejectedValue(
      new FirebaseError("permission-denied", "msg"),
    );

    const result = await deleteTask("task-1");

    expect(result).toEqual({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });
  });
});
