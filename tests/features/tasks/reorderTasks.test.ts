import { describe, it, expect } from "vitest";
import { reorderTasks } from "../../../src/features/tasks/reorderTasks";
import type { Task } from "../../../src/types/task";

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

describe("reorderTasks", () => {
  const a = makeTask("a");
  const b = makeTask("b");
  const c = makeTask("c");
  const tasks = [a, b, c];

  it("mueve la tarea arrastrada a la posición de la tarea destino", () => {
    const result = reorderTasks(tasks, "a", "c");

    expect(result.map((task) => task.id)).toEqual(["b", "c", "a"]);
  });

  it("mueve hacia atrás igual que hacia adelante", () => {
    const result = reorderTasks(tasks, "c", "a");

    expect(result.map((task) => task.id)).toEqual(["c", "a", "b"]);
  });

  it("no hace nada si se suelta sobre la misma tarea", () => {
    const result = reorderTasks(tasks, "b", "b");

    expect(result).toBe(tasks);
  });

  it("no hace nada si alguno de los ids no existe en la lista", () => {
    const result = reorderTasks(tasks, "a", "no-existe");

    expect(result).toBe(tasks);
  });

  it("no muta el array original", () => {
    const original = [...tasks];

    reorderTasks(tasks, "a", "c");

    expect(tasks).toEqual(original);
  });
});
