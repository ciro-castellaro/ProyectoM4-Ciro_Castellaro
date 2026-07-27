import TodoForm from "../TodoForm/TodoForm";
import type { Task } from "../../types/task";
import "./TodoItem.css";

interface TodoItemProps {
  task: Task;
  isEditing: boolean;
  isTogglePending: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onSaveEdit: (
    id: string,
    values: { title: string; description: string },
  ) => void;
  onCancelEdit: () => void;
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
  function handleDelete() {
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      onDelete(task.id);
    }
  }

  if (isEditing) {
    return (
      <li className="todo-item card">
        <h2>Editando tarea</h2>
        <TodoForm
          initialValues={{ title: task.title, description: task.description }}
          onSubmit={async (values) => {
            // Todavía sin Firestore: la edición se guarda solo en memoria
            // hasta que la Etapa 3.7 conecte la persistencia real. Se
            // envuelve en una promesa para cumplir el mismo contrato async
            // que ya usa la creación.
            onSaveEdit(task.id, values);
            return { ok: true, value: undefined };
          }}
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
        <button type="button" className="danger" onClick={handleDelete}>
          Eliminar
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
