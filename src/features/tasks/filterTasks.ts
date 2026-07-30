import type { Task, TaskFilter } from "../../types/task";

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "pending":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    case "all":
      return tasks;
  }
}
