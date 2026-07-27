import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "../../src/components/TodoItem/TodoItem";
import type { Task } from "../../src/types/task";

const baseTask: Task = {
  id: "task-1",
  userId: "user-1",
  title: "Comprar leche",
  description: "1 litro, descremada",
  completed: false,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
};

describe("TodoItem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el título, la descripción y el estado pendiente", () => {
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText("1 litro, descremada")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("muestra el estado completada cuando la tarea está completa", () => {
    render(
      <TodoItem
        task={{ ...baseTask, completed: true }}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/completada/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("llama a onToggleComplete al hacer clic en el checkbox", async () => {
    const handleToggle = vi.fn();
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={handleToggle}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("checkbox"));

    expect(handleToggle).toHaveBeenCalledWith("task-1");
  });

  it("deshabilita el checkbox y muestra 'Guardando...' mientras se persiste el cambio", () => {
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });

  it("llama a onStartEdit al hacer clic en Editar", async () => {
    const handleStartEdit = vi.fn();
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={handleStartEdit}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    expect(handleStartEdit).toHaveBeenCalledWith("task-1");
  });

  it("muestra un modal de confirmación al hacer clic en Eliminar", async () => {
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    const dialog = screen.getByRole("dialog", { name: /eliminar tarea/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/comprar leche/i)).toBeInTheDocument();
  });

  it("llama a onDelete al confirmar en el modal", async () => {
    const handleDelete = vi.fn().mockResolvedValue({ ok: true, value: undefined });
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={handleDelete}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^eliminar$/i }),
    );

    expect(handleDelete).toHaveBeenCalledWith("task-1");
  });

  it("no llama a onDelete si se cancela en el modal, y lo cierra", async () => {
    const handleDelete = vi.fn();
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={handleDelete}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(handleDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("muestra el error y mantiene el modal abierto si falla la eliminación", async () => {
    const handleDelete = vi.fn().mockResolvedValue({
      ok: false,
      error: "No se pudo eliminar la tarea.",
    });
    render(
      <TodoItem
        task={baseTask}
        isEditing={false}
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={handleDelete}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^eliminar$/i }),
    );

    expect(
      await screen.findByText(/no se pudo eliminar la tarea/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  describe("en modo edición", () => {
    beforeEach(() => {
      render(
        <TodoItem
          task={baseTask}
          isEditing
          isTogglePending={false}
          onToggleComplete={vi.fn()}
          onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
          onStartEdit={vi.fn()}
          onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
          onCancelEdit={vi.fn()}
        />,
      );
    });

    it("precarga el formulario con los datos actuales de la tarea", () => {
      expect(screen.getByLabelText(/título/i)).toHaveValue("Comprar leche");
      expect(screen.getByLabelText(/descripción/i)).toHaveValue(
        "1 litro, descremada",
      );
    });
  });

  it("llama a onSaveEdit con los nuevos valores al guardar en modo edición", async () => {
    const handleSaveEdit = vi.fn().mockResolvedValue({ ok: true, value: undefined });
    render(
      <TodoItem
        task={baseTask}
        isEditing
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={vi.fn()}
      />,
    );

    const titleInput = screen.getByLabelText(/título/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Comprar pan");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(handleSaveEdit).toHaveBeenCalledWith("task-1", {
      title: "Comprar pan",
      description: "1 litro, descremada",
    });
  });

  it("llama a onCancelEdit al cancelar la edición", async () => {
    const handleCancelEdit = vi.fn();
    render(
      <TodoItem
        task={baseTask}
        isEditing
        isTogglePending={false}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn().mockResolvedValue({ ok: true, value: undefined })}
        onCancelEdit={handleCancelEdit}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(handleCancelEdit).toHaveBeenCalledTimes(1);
  });
});
