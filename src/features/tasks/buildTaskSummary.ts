import type { Task } from "../../types/task";
import type { TaskSummary } from "../../types/email";

export function buildTaskSummary(tasks: Task[]): TaskSummary {
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return {
    total: tasks.length,
    pending: pendingTasks.length,
    completed: completedTasks.length,
    pendingTitles: pendingTasks.map((task) => task.title),
    completedTitles: completedTasks.map((task) => task.title),
  };
}
