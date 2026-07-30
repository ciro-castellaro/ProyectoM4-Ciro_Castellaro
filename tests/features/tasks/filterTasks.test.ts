import { describe, it, expect } from "vitest";
import { filterTasks } from "../../../src/features/tasks/filterTasks";
import type { Task } from "../../../src/types/task";

const pendingTask: Task = {
  id: "task-1",
  userId: "user-1",
  title: "Comprar leche",
  description: "",
  completed: false,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
};

const completedTask: Task = {
  ...pendingTask,
  id: "task-2",
  title: "Comprar pan",
  completed: true,
};

const tasks = [pendingTask, completedTask];

describe("filterTasks", () => {
  it("con 'all' devuelve todas las tareas sin cambios", () => {
    expect(filterTasks(tasks, "all")).toEqual(tasks);
  });

  it("con 'pending' devuelve solo las tareas no completadas", () => {
    expect(filterTasks(tasks, "pending")).toEqual([pendingTask]);
  });

  it("con 'completed' devuelve solo las tareas completadas", () => {
    expect(filterTasks(tasks, "completed")).toEqual([completedTask]);
  });

  it("devuelve un array vacío si no hay tareas", () => {
    expect(filterTasks([], "all")).toEqual([]);
    expect(filterTasks([], "pending")).toEqual([]);
    expect(filterTasks([], "completed")).toEqual([]);
  });
});
