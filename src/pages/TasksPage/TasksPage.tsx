import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { createTask, updateTask } from "../../services/firebase/tasks";
import AppHeader from "../../components/AppHeader/AppHeader";
import TodoForm from "../../components/TodoForm/TodoForm";
import TodoList from "../../components/TodoList/TodoList";
import "./TasksPage.css";

function TasksPage() {
  const { data: user } = useAuth();
  const { tasksState, setTasksState } = useTasks(user?.uid);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const tasks = tasksState.data ?? [];
  const pendingCount = tasks.filter((task) => !task.completed).length;

  async function handleCreateTask(values: {
    title: string;
    description: string;
  }) {
    if (!user) {
      return {
        ok: false,
        error: "Tenés que iniciar sesión para crear tareas.",
      } as const;
    }

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

  function handleDeleteTask(id: string) {
    setTasksState((prev) => ({
      ...prev,
      data: (prev.data ?? []).filter((task) => task.id !== id),
    }));
  }

  function handleSaveEdit(
    id: string,
    values: { title: string; description: string },
  ) {
    setTasksState((prev) => ({
      ...prev,
      data: (prev.data ?? []).map((task) =>
        task.id === id
          ? {
              ...task,
              title: values.title,
              description: values.description,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
    setEditingTaskId(null);
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
            onClick={() => setIsCreating(true)}
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

        <TodoList
          tasksState={tasksState}
          editingTaskId={editingTaskId}
          pendingTaskId={pendingTaskId}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onStartEdit={setEditingTaskId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingTaskId(null)}
          onCreateFirst={() => setIsCreating(true)}
        />
      </main>
    </>
  );
}

export default TasksPage;
