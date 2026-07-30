import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "../../types/task";

// `activeId`/`overId` son los ids que entrega dnd-kit al soltar (el elemento
// arrastrado y el que estaba en la posición de destino). Delegamos el cálculo
// del array reordenado a `arrayMove` (utilidad de dnd-kit), y acá solo
// traducimos ids a índices y cubrimos los casos borde.
export function reorderTasks(
  tasks: Task[],
  activeId: string,
  overId: string,
): Task[] {
  if (activeId === overId) {
    return tasks;
  }

  const fromIndex = tasks.findIndex((task) => task.id === activeId);
  const toIndex = tasks.findIndex((task) => task.id === overId);

  if (fromIndex === -1 || toIndex === -1) {
    return tasks;
  }

  return arrayMove(tasks, fromIndex, toIndex);
}
