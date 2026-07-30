import { describe, it, expect } from "vitest";
import { sortTasks } from "../../../src/features/tasks/sortTasks";
import type { Task } from "../../../src/types/task";

const baseTask: Task = {
  id: "task-1",
  userId: "user-1",
  title: "Tarea",
  description: "",
  completed: false,
  priority: "medium",
  dueDate: null,
  order: 1,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
};

describe("sortTasks", () => {
  it("con 'default' devuelve las tareas en el mismo orden", () => {
    const tasks = [
      { ...baseTask, id: "1" },
      { ...baseTask, id: "2" },
    ];

    expect(sortTasks(tasks, "default")).toEqual(tasks);
  });

  it("con 'default' no muta ni devuelve la misma referencia", () => {
    const tasks = [{ ...baseTask, id: "1" }];

    const result = sortTasks(tasks, "default");

    expect(result).not.toBe(tasks);
  });

  it("con 'priority' ordena de alta a baja", () => {
    const low = { ...baseTask, id: "low", priority: "low" as const };
    const high = { ...baseTask, id: "high", priority: "high" as const };
    const medium = { ...baseTask, id: "medium", priority: "medium" as const };

    const result = sortTasks([low, high, medium], "priority");

    expect(result.map((task) => task.id)).toEqual(["high", "medium", "low"]);
  });

  it("con 'dueDate' ordena de fecha más próxima a más lejana", () => {
    const later = { ...baseTask, id: "later", dueDate: "2026-05-01" };
    const sooner = { ...baseTask, id: "sooner", dueDate: "2026-03-01" };

    const result = sortTasks([later, sooner], "dueDate");

    expect(result.map((task) => task.id)).toEqual(["sooner", "later"]);
  });

  it("con 'dueDate' deja las tareas sin fecha al final", () => {
    const withDate = { ...baseTask, id: "with-date", dueDate: "2026-03-01" };
    const withoutDate = { ...baseTask, id: "without-date", dueDate: null };

    const result = sortTasks([withoutDate, withDate], "dueDate");

    expect(result.map((task) => task.id)).toEqual(["with-date", "without-date"]);
  });

  it("no muta el array original", () => {
    const tasks = [
      { ...baseTask, id: "low", priority: "low" as const },
      { ...baseTask, id: "high", priority: "high" as const },
    ];
    const original = [...tasks];

    sortTasks(tasks, "priority");

    expect(tasks).toEqual(original);
  });
});
