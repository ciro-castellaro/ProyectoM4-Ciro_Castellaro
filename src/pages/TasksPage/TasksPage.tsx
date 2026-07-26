import { useState } from "react";
import type { Task } from "../../types/task";
import type { AsyncState } from "../../types/async";
import { useAuth } from "../../hooks/useAuth";
import AppHeader from "../../components/AppHeader/AppHeader";
import TodoForm from "../../components/TodoForm/TodoForm";
import TodoList from "../../components/TodoList/TodoList";
import "./TasksPage.css";

function TasksPage() {
  const { data: user } = useAuth();
  const [tasksState, setTasksState] = useState<AsyncState<Task[]>>({
    status: "success",
    data: [],
    error: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const tasks = tasksState.data ?? [];
  const pendingCount = tasks.filter((task) => !task.completed).length;

  function handleCreateTask(values: { title: string; description: string }) {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: user?.uid ?? "",
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTasksState((prev) => ({
      ...prev,
      data: [newTask, ...(prev.data ?? [])],
    }));
    setIsCreating(false);
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
