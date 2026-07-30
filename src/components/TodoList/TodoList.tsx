import type { Task, TaskFilter } from "../../types/task";
import type { AsyncState } from "../../types/async";
import type { Result } from "../../types/result";
import { filterTasks } from "../../features/tasks/filterTasks";
import TodoItem from "../TodoItem/TodoItem";
import "./TodoList.css";

interface TodoListProps {
  tasksState: AsyncState<Task[]>;
  filter: TaskFilter;
  editingTaskId: string | null;
  pendingTaskId: string | null;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => Promise<Result<unknown>>;
  onStartEdit: (id: string) => void;
  onSaveEdit: (
    id: string,
    values: { title: string; description: string },
  ) => Promise<Result<unknown>>;
  onCancelEdit: () => void;
  onCreateFirst: () => void;
}

function TodoList({
  tasksState,
  filter,
  editingTaskId,
  pendingTaskId,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCreateFirst,
}: TodoListProps) {
  if (tasksState.status === "loading") {
    return (
      <p className="list-status" role="status">
        Cargando tareas...
      </p>
    );
  }

  if (tasksState.status === "error") {
    return (
      <p className="list-error" role="alert">
        ⚠ {tasksState.error ?? "Ocurrió un error al cargar las tareas."}
      </p>
    );
  }

  const tasks = tasksState.data ?? [];

  if (tasks.length === 0) {
    return (
      <section className="empty-state">
        <p className="empty-state-icon" aria-hidden="true">
          🗒️
        </p>
        <h2 className="empty-state-title">Todavía no tenés tareas</h2>
        <p className="empty-state-text">
          Creá tu primera tarea para empezar a organizar tu día.
        </p>
        <button type="button" className="primary" onClick={onCreateFirst}>
          Crear mi primera tarea
        </button>
      </section>
    );
  }

  const filteredTasks = filterTasks(tasks, filter);

  if (filteredTasks.length === 0) {
    return (
      <p className="list-status" role="status">
        {filter === "pending"
          ? "No tenés tareas pendientes."
          : "No tenés tareas completadas."}
      </p>
    );
  }

  return (
    <ul className="todo-list">
      {filteredTasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          isEditing={editingTaskId === task.id}
          isTogglePending={pendingTaskId === task.id}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </ul>
  );
}

export default TodoList;
