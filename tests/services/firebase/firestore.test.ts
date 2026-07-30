import { describe, it, expect } from "vitest";
import { Timestamp, type QueryDocumentSnapshot } from "firebase/firestore";
import { taskFromDocument } from "../../../src/services/firebase/firestore";

function createFakeSnapshot(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: () => data,
  } as QueryDocumentSnapshot;
}

describe("taskFromDocument", () => {
  it("convierte un documento de Firestore al tipo Task, con fechas ISO", () => {
    const createdAt = Timestamp.fromDate(new Date("2026-01-10T12:00:00.000Z"));
    const updatedAt = Timestamp.fromDate(new Date("2026-01-11T09:30:00.000Z"));

    const snapshot = createFakeSnapshot("task-1", {
      userId: "user-abc",
      title: "Comprar leche",
      description: "Leche descremada, 1 litro",
      completed: false,
      priority: "high",
      dueDate: "2026-02-01",
      order: 42,
      createdAt,
      updatedAt,
    });

    const task = taskFromDocument(snapshot);

    expect(task).toEqual({
      id: "task-1",
      userId: "user-abc",
      title: "Comprar leche",
      description: "Leche descremada, 1 litro",
      completed: false,
      priority: "high",
      dueDate: "2026-02-01",
      order: 42,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-01-11T09:30:00.000Z",
    });
  });

  it("usa valores por defecto si el documento no tiene priority, dueDate ni order (tareas creadas antes de agregar estos campos)", () => {
    const createdAt = Timestamp.fromDate(new Date("2026-01-10T12:00:00.000Z"));

    const snapshot = createFakeSnapshot("task-old", {
      userId: "user-abc",
      title: "Tarea vieja",
      description: "",
      completed: false,
      createdAt,
      updatedAt: createdAt,
    });

    const task = taskFromDocument(snapshot);

    expect(task.priority).toBe("medium");
    expect(task.dueDate).toBeNull();
    expect(task.order).toBe(createdAt.toMillis());
  });

  it("usa el id del documento de Firestore, no un campo interno", () => {
    const now = Timestamp.now();

    const snapshot = createFakeSnapshot("doc-generado-por-firestore", {
      userId: "user-abc",
      title: "Tarea",
      description: "",
      completed: true,
      createdAt: now,
      updatedAt: now,
    });

    const task = taskFromDocument(snapshot);

    expect(task.id).toBe("doc-generado-por-firestore");
  });
});
