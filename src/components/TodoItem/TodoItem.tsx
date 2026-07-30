import { useState } from "react";
import TodoForm from "../TodoForm/TodoForm";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import type { Task, TaskPriority } from "../../types/task";
import type { Result } from "../../types/result";
import "./TodoItem.css";

interface TodoItemProps {
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

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

// "YYYY-MM-DD" -> "DD/MM/YYYY" por manipulación de string, sin pasar por
// `Date`: evita el corrimiento de un día por zona horaria.
function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-");
  return `${day}/${month}/${year}`;
}

function TodoItem({
  task,
  isEditing,
  isTogglePending,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: TodoItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const result = await onDelete(task.id);
    setIsDeleting(false);

    if (result.ok) {
      setIsConfirmingDelete(false);
    } else {
      setDeleteError(result.error);
    }
  }

  if (isEditing) {
    return (
      <li className="todo-item card">
        <h2>Editando tarea</h2>
        <TodoForm
          initialValues={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
          }}
          onSubmit={(values) => onSaveEdit(task.id, values)}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li className={`todo-item card${task.completed ? " completed" : ""}`}>
      <div className="todo-item-main">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={isTogglePending}
          onChange={() => onToggleComplete(task.id)}
          aria-label={
            task.completed
              ? `Marcar "${task.title}" como pendiente`
              : `Marcar "${task.title}" como completada`
          }
        />

        <div className="todo-item-content">
          <p className="todo-item-title">{task.title}</p>
          {task.description && (
            <p className="todo-item-description">{task.description}</p>
          )}
          <div className="todo-item-meta">
            <span
              className={`todo-item-priority priority-${task.priority}`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.dueDate && (
              <span className="todo-item-due-date">
                Vence: {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
          <p className="todo-item-status">
            {isTogglePending
              ? "Guardando..."
              : task.completed
                ? "✓ Completada"
                : "Pendiente"}
          </p>
        </div>
      </div>

      <div className="todo-item-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => onStartEdit(task.id)}
        >
          Editar
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => {
            setDeleteError(null);
            setIsConfirmingDelete(true);
          }}
        >
          Eliminar
        </button>
      </div>

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Eliminar tarea"
          description={`¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          isConfirming={isDeleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </li>
  );
}

export default TodoItem;
