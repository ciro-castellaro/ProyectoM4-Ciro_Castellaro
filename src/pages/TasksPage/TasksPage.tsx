import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { createTask } from "../../services/firebase/tasks";
import AppHeader from "../../components/AppHeader/AppHeader";
import TodoForm from "../../components/TodoForm/TodoForm";
import TodoList from "../../components/TodoList/TodoList";
import "./TasksPage.css";

function TasksPage() {
  const { data: user } = useAuth();
  const { tasksState, setTasksState, refetch } = useTasks(user?.uid);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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
      setIsCreating(false);
      refetch();
    }

    return result;
  }

  function handleToggleComplete(id: string) {
    setTasksState((prev) => ({
      ...prev,
      data: (prev.data ?? []).map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
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

        <TodoList
          tasksState={tasksState}
          editingTaskId={editingTaskId}
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
