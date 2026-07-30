import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import {
  createTask,
  updateTask,
  updateTasksOrder,
  deleteTask,
} from "../../services/firebase/tasks";
import { sendSummaryEmail } from "../../services/email/sendSummary";
import { buildTaskSummary } from "../../features/tasks/buildTaskSummary";
import { reorderTasks } from "../../features/tasks/reorderTasks";
import type { TaskFilter, TaskPriority, TaskSortOption } from "../../types/task";
import AppHeader from "../../components/AppHeader/AppHeader";
import TodoForm from "../../components/TodoForm/TodoForm";
import TodoList from "../../components/TodoList/TodoList";
import TaskFilters from "../../components/TaskFilters/TaskFilters";
import TaskSort from "../../components/TaskSort/TaskSort";
import EmailSummary from "../../components/EmailSummary/EmailSummary";
import "./TasksPage.css";

function TasksPage() {
  const { data: user } = useAuth();
  const { tasksState, setTasksState } = useTasks(user?.uid);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sortBy, setSortBy] = useState<TaskSortOption>("default");

  const tasks = tasksState.data ?? [];
  const pendingCount = tasks.filter((task) => !task.completed).length;

  async function handleCreateTask(values: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
  }) {
    if (!user) {
      return {
        ok: false,
        error: "Tenés que iniciar sesión para crear tareas.",
      } as const;
    }

    setActionError(null);
    const result = await createTask(user.uid, values);

    if (result.ok) {
      // Ya sabemos exactamente qué se creó (Firestore nos devuelve el
      // documento con su id real), así que la agregamos directo al estado
      // local en vez de volver a pedir toda la colección: evita el
      // parpadeo de "Cargando tareas..." por un solo documento nuevo.
      setTasksState((prev) => ({
        ...prev,
        data: [result.value, ...(prev.data ?? [])],
      }));
      setIsCreating(false);
    }

    return result;
  }

  async function handleToggleComplete(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    setActionError(null);
    setPendingTaskId(id);
    const result = await updateTask(id, { completed: !task.completed });
    setPendingTaskId(null);

    if (result.ok) {
      // Mismo motivo que en la creación: ya sabemos qué cambió, no hace
      // falta releer toda la colección para reflejarlo.
      setTasksState((prev) => ({
        ...prev,
        data: (prev.data ?? []).map((item) =>
          item.id === id
            ? {
                ...item,
                completed: !item.completed,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      }));
    } else {
      setActionError(result.error);
    }
  }

  async function handleDeleteTask(id: string) {
    setActionError(null);
    const result = await deleteTask(id);

    if (result.ok) {
      setTasksState((prev) => ({
        ...prev,
        data: (prev.data ?? []).filter((task) => task.id !== id),
      }));
    }

    return result;
  }

  async function handleSaveEdit(
    id: string,
    values: {
      title: string;
      description: string;
      priority: TaskPriority;
      dueDate: string | null;
    },
  ) {
    setActionError(null);
    const result = await updateTask(id, {
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
    });

    if (result.ok) {
      // Mismo patrón que crear/completar: parchear localmente lo que ya
      // sabemos que cambió, sin releer toda la colección.
      setTasksState((prev) => ({
        ...prev,
        data: (prev.data ?? []).map((task) =>
          task.id === id
            ? {
                ...task,
                title: values.title,
                description: values.description,
                priority: values.priority,
                dueDate: values.dueDate,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      }));
      setEditingTaskId(null);
    }

    return result;
  }

  // Solo se pasa a TodoList como `onReorder` cuando el filtro es "all" y el
  // orden es "default" (ver el JSX más abajo), así que acá `tasks` siempre
  // es exactamente la lista visible al arrastrar: no hace falta filtrar ni
  // ordenar de nuevo.
  async function handleReorder(activeId: string, overId: string) {
    const reordered = reorderTasks(tasks, activeId, overId);

    setActionError(null);
    const result = await updateTasksOrder(reordered);

    if (result.ok) {
      setTasksState((prev) => ({ ...prev, data: reordered }));
    } else {
      setActionError(result.error);
    }
  }

  async function handleSendSummary() {
    if (!user) {
      return {
        ok: false,
        error: "Tenés que iniciar sesión para enviar el resumen.",
      } as const;
    }

    const idToken = await user.getIdToken();
    return sendSummaryEmail(idToken, buildTaskSummary(tasks));
  }

  return (
    <>
      <AppHeader />

      <main className="tasks-container">
        <section className="tasks-toolbar">
          <div>
            <h1>Mis tareas</h1>
            <p className="tasks-counter">
              {pendingCount} tarea{pendingCount === 1 ? "" : "s"} pendiente
              {pendingCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setEditingTaskId(null);
              setIsCreating(true);
            }}
          >
            Nueva tarea
          </button>
        </section>

        {isCreating && (
          <section className="card">
            <h2>Nueva tarea</h2>
            <TodoForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsCreating(false)}
            />
          </section>
        )}

        {actionError && (
          <p className="field-error" role="alert">
            ⚠ {actionError}
          </p>
        )}

        {tasks.length > 0 && (
          <div className="tasks-controls">
            <TaskFilters value={filter} onChange={setFilter} />
            <TaskSort value={sortBy} onChange={setSortBy} />
          </div>
        )}

        <TodoList
          tasksState={tasksState}
          filter={filter}
          sortBy={sortBy}
          editingTaskId={editingTaskId}
          pendingTaskId={pendingTaskId}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onStartEdit={(id) => {
            setIsCreating(false);
            setEditingTaskId(id);
          }}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingTaskId(null)}
          onCreateFirst={() => setIsCreating(true)}
          onReorder={
            filter === "all" && sortBy === "default" ? handleReorder : undefined
          }
        />

        <EmailSummary
          summary={buildTaskSummary(tasks)}
          onSend={handleSendSummary}
        />
      </main>
    </>
  );
}

export default TasksPage;
