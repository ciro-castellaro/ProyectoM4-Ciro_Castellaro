import { useState } from "react";
import type { Task } from "../types/task";
import AppHeader from "../components/AppHeader";
import TodoForm from "../components/TodoForm";

function TasksPage() {
  const [tasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedTitle, setLastCreatedTitle] = useState<string | null>(
    null,
  );

  const pendingCount = tasks.filter((task) => !task.completed).length;

  function handleCreateTask(values: { title: string; description: string }) {
    setLastCreatedTitle(values.title);
    setIsCreating(false);
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

        {lastCreatedTitle && (
          <p role="status">
            ✓ "{lastCreatedTitle}" es una tarea válida. Guardarla y mostrarla
            en la lista se agrega en las próximas etapas.
          </p>
        )}

        {tasks.length === 0 && (
          <section className="empty-state">
            <p className="empty-state-icon" aria-hidden="true">
              🗒️
            </p>
            <h2 className="empty-state-title">Todavía no tenés tareas</h2>
            <p className="empty-state-text">
              Creá tu primera tarea para empezar a organizar tu día.
            </p>
            <button
              type="button"
              className="primary"
              onClick={() => setIsCreating(true)}
            >
              Crear mi primera tarea
            </button>
          </section>
        )}
      </main>
    </>
  );
}

export default TasksPage;
