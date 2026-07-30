import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskFilter, TaskPriority, TaskSortOption } from "../../types/task";
import type { AsyncState } from "../../types/async";
import type { Result } from "../../types/result";
import { filterTasks } from "../../features/tasks/filterTasks";
import { sortTasks } from "../../features/tasks/sortTasks";
import TodoItem from "../TodoItem/TodoItem";
import SortableTodoItem from "../SortableTodoItem/SortableTodoItem";
import "./TodoList.css";

interface TodoListProps {
  tasksState: AsyncState<Task[]>;
  filter: TaskFilter;
  sortBy: TaskSortOption;
  editingTaskId: string | null;
  pendingTaskId: string | null;
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
  onCreateFirst: () => void;
  // El arrastre manual solo tiene sentido mostrando todas las tareas sin
  // ordenar por otro criterio: si hay un filtro o un orden calculado activos,
  // esta prop no se pasa y la lista se renderiza sin drag & drop.
  onReorder?: (activeId: string, overId: string) => void;
}

function TodoList({
  tasksState,
  filter,
  sortBy,
  editingTaskId,
  pendingTaskId,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCreateFirst,
  onReorder,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
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

  const visibleTasks = sortTasks(filteredTasks, sortBy);

  if (!onReorder) {
    return (
      <ul className="todo-list">
        {visibleTasks.map((task) => (
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder?.(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={visibleTasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="todo-list">
          {visibleTasks.map((task) => (
            <SortableTodoItem
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
      </SortableContext>
    </DndContext>
  );
}

export default TodoList;
