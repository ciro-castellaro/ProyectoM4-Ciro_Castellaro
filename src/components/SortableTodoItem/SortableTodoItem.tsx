import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoItem from "../TodoItem/TodoItem";
import type { Task, TaskPriority } from "../../types/task";
import type { Result } from "../../types/result";

interface SortableTodoItemProps {
  task: Task;
  isEditing: boolean;
  isTogglePending: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => Promise<Result<unknown>>;
  onStartEdit: (id: string) => void;
  onSaveEdit: (
    id: string,
    values: {
      title: string;
      description: string;
      priority: TaskPriority;
      dueDate: string | null;
    },
  ) => Promise<Result<unknown>>;
  onCancelEdit: () => void;
}

// Capa fina que conecta un TodoItem con dnd-kit: TodoItem no importa nada de
// la librería, solo recibe una prop `sortable` genérica.
function SortableTodoItem({ task, ...rest }: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <TodoItem
      task={task}
      {...rest}
      sortable={{
        setNodeRef,
        style: {
          transform: CSS.Transform.toString(transform),
          transition,
        },
        isDragging,
        attributes,
        listeners,
      }}
    />
  );
}

export default SortableTodoItem;
