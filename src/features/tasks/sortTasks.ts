import type { Task, TaskSortOption } from "../../types/task";

const PRIORITY_WEIGHT: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

// Siempre devuelve un array nuevo: `Array.sort` muta in-place, y el array
// de entrada puede ser el mismo `state.data` que usa React para renderizar.
export function sortTasks(tasks: Task[], sortBy: TaskSortOption): Task[] {
  if (sortBy === "priority") {
    return [...tasks].sort(
      (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
    );
  }

  if (sortBy === "dueDate") {
    return [...tasks].sort((a, b) => {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  return [...tasks];
}
