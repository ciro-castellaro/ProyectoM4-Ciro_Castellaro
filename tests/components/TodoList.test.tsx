import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TodoList from "../../src/components/TodoList/TodoList";
import type { Task } from "../../src/types/task";
import type { AsyncState } from "../../src/types/async";

const task: Task = {
  id: "task-1",
  userId: "user-1",
  title: "Comprar leche",
  description: "1 litro",
  completed: false,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
};

const noopHandlers = {
  onToggleComplete: vi.fn(),
  onDelete: vi.fn(),
  onStartEdit: vi.fn(),
  onSaveEdit: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  onCancelEdit: vi.fn(),
  onCreateFirst: vi.fn(),
};

describe("TodoList", () => {
  it("muestra un indicador de carga cuando el estado es loading", () => {
    const tasksState: AsyncState<Task[]> = {
      status: "loading",
      data: null,
      error: null,
    };

    render(
      <TodoList
        tasksState={tasksState}
        editingTaskId={null}
        pendingTaskId={null}
        {...noopHandlers}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i);
  });

  it("muestra un mensaje de error cuando el estado es error", () => {
    const tasksState: AsyncState<Task[]> = {
      status: "error",
      data: null,
      error: "No se pudieron cargar las tareas.",
    };

    render(
      <TodoList
        tasksState={tasksState}
        editingTaskId={null}
        pendingTaskId={null}
        {...noopHandlers}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /no se pudieron cargar las tareas/i,
    );
  });

  it("muestra el estado vacío cuando no hay tareas", async () => {
    const tasksState: AsyncState<Task[]> = {
      status: "success",
      data: [],
      error: null,
    };

    render(
      <TodoList
        tasksState={tasksState}
        editingTaskId={null}
        pendingTaskId={null}
        {...noopHandlers}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /todavía no tenés tareas/i }),
    ).toBeInTheDocument();
  });

  it("muestra una tarjeta por cada tarea cuando hay datos", () => {
    const tasksState: AsyncState<Task[]> = {
      status: "success",
      data: [task, { ...task, id: "task-2", title: "Comprar pan" }],
      error: null,
    };

    render(
      <TodoList
        tasksState={tasksState}
        editingTaskId={null}
        pendingTaskId={null}
        {...noopHandlers}
      />,
    );

    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
  });
});
