import { describe, it, expect } from "vitest";
import { buildTaskSummary } from "../../../src/features/tasks/buildTaskSummary";
import type { Task } from "../../../src/types/task";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Tarea",
    description: "",
    completed: false,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildTaskSummary", () => {
  it("devuelve todo en cero para una lista vacía", () => {
    expect(buildTaskSummary([])).toEqual({
      total: 0,
      pending: 0,
      completed: 0,
      pendingTitles: [],
      completedTitles: [],
    });
  });

  it("cuenta y separa correctamente tareas pendientes y completadas", () => {
    const tasks = [
      makeTask({ id: "1", title: "Comprar leche", completed: false }),
      makeTask({ id: "2", title: "Pagar el alquiler", completed: true }),
      makeTask({ id: "3", title: "Lavar el auto", completed: false }),
    ];

    expect(buildTaskSummary(tasks)).toEqual({
      total: 3,
      pending: 2,
      completed: 1,
      pendingTitles: ["Comprar leche", "Lavar el auto"],
      completedTitles: ["Pagar el alquiler"],
    });
  });

  it("cuando todas las tareas están completadas, pendingTitles queda vacío", () => {
    const tasks = [
      makeTask({ id: "1", title: "Comprar leche", completed: true }),
      makeTask({ id: "2", title: "Pagar el alquiler", completed: true }),
    ];

    const summary = buildTaskSummary(tasks);

    expect(summary.pending).toBe(0);
    expect(summary.pendingTitles).toEqual([]);
    expect(summary.completedTitles).toEqual(["Comprar leche", "Pagar el alquiler"]);
  });
});
