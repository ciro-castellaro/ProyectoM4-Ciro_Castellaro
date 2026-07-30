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
  priority: "medium",
  dueDate: null,
  order: 1,
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
        filter="all"
        sortBy="default"
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
        filter="all"
        sortBy="default"
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
        filter="all"
        sortBy="default"
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
        filter="all"
        sortBy="default"
        editingTaskId={null}
        pendingTaskId={null}
        {...noopHandlers}
      />,
    );

    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
  });

  describe("filtro", () => {
    const tasksState: AsyncState<Task[]> = {
      status: "success",
      data: [
        task,
        { ...task, id: "task-2", title: "Comprar pan", completed: true },
      ],
      error: null,
    };

    it("con 'pending' muestra solo las tareas no completadas", () => {
      render(
        <TodoList
          tasksState={tasksState}
          filter="pending"
          sortBy="default"
          editingTaskId={null}
          pendingTaskId={null}
          {...noopHandlers}
        />,
      );

      expect(screen.getByText("Comprar leche")).toBeInTheDocument();
      expect(screen.queryByText("Comprar pan")).not.toBeInTheDocument();
    });

    it("con 'completed' muestra solo las tareas completadas", () => {
      render(
        <TodoList
          tasksState={tasksState}
          filter="completed"
          sortBy="default"
          editingTaskId={null}
          pendingTaskId={null}
          {...noopHandlers}
        />,
      );

      expect(screen.getByText("Comprar pan")).toBeInTheDocument();
      expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
    });

    it("muestra un mensaje (no el estado vacío general) si ninguna tarea coincide con el filtro", () => {
      const onlyPending: AsyncState<Task[]> = {
        status: "success",
        data: [task],
        error: null,
      };

      render(
        <TodoList
          tasksState={onlyPending}
          filter="completed"
          sortBy="default"
          editingTaskId={null}
          pendingTaskId={null}
          {...noopHandlers}
        />,
      );

      expect(screen.getByText(/no tenés tareas completadas/i)).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /todavía no tenés tareas/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("orden", () => {
    it("con 'priority' muestra primero las tareas de mayor prioridad", () => {
      const tasksState: AsyncState<Task[]> = {
        status: "success",
        data: [
          { ...task, id: "low", title: "Comprar leche", priority: "low" },
          { ...task, id: "high", title: "Comprar pan", priority: "high" },
        ],
        error: null,
      };

      render(
        <TodoList
          tasksState={tasksState}
          filter="all"
          sortBy="priority"
          editingTaskId={null}
          pendingTaskId={null}
          {...noopHandlers}
        />,
      );

      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Comprar pan");
      expect(items[1]).toHaveTextContent("Comprar leche");
    });
  });

  describe("arrastre", () => {
    const tasksState: AsyncState<Task[]> = {
      status: "success",
      data: [task, { ...task, id: "task-2", title: "Comprar pan" }],
      error: null,
    };

    it("no muestra handles de arrastre si no se pasa onReorder", () => {
      render(
        <TodoList
          tasksState={tasksState}
          filter="all"
          sortBy="default"
          editingTaskId={null}
          pendingTaskId={null}
          {...noopHandlers}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /reordenar/i }),
      ).not.toBeInTheDocument();
    });

    it("muestra un handle de arrastre por tarea cuando se pasa onReorder", () => {
      render(
        <TodoList
          tasksState={tasksState}
          filter="all"
          sortBy="default"
          editingTaskId={null}
          pendingTaskId={null}
          onReorder={vi.fn()}
          {...noopHandlers}
        />,
      );

      expect(
        screen.getAllByRole("button", { name: /reordenar/i }),
      ).toHaveLength(2);
    });
  });
});
