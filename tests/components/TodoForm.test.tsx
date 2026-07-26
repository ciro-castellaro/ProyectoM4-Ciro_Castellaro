import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoForm from "../../src/components/TodoForm/TodoForm";
import type { Result } from "../../src/types/result";

describe("TodoForm", () => {
  it("muestra los campos de título y descripción", () => {
    render(<TodoForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it("muestra un error de validación y no llama a onSubmit si el título está vacío", async () => {
    const handleSubmit = vi.fn();
    render(<TodoForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("llama a onSubmit con los valores saneados y limpia el formulario", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({ ok: true, value: undefined });
    render(<TodoForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await userEvent.type(
      screen.getByLabelText(/título/i),
      "  Comprar leche  ",
    );
    await userEvent.type(
      screen.getByLabelText(/descripción/i),
      "  1 litro  ",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Comprar leche",
      description: "1 litro",
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue("");
    });
    expect(screen.getByLabelText(/descripción/i)).toHaveValue("");
  });

  it("acepta una descripción vacía", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({ ok: true, value: undefined });
    render(<TodoForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/título/i), "Comprar leche");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Comprar leche",
      description: "",
    });
  });

  it("llama a onCancel al hacer clic en Cancelar", async () => {
    const handleCancel = vi.fn();
    render(<TodoForm onSubmit={vi.fn()} onCancel={handleCancel} />);

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("precarga los campos con initialValues, para reutilizarse en edición", () => {
    render(
      <TodoForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ title: "Comprar leche", description: "1 litro" }}
      />,
    );

    expect(screen.getByLabelText(/título/i)).toHaveValue("Comprar leche");
    expect(screen.getByLabelText(/descripción/i)).toHaveValue("1 litro");
  });

  it("muestra un mensaje de carga mientras se guarda la tarea", async () => {
    let resolveSubmit!: (result: Result<unknown>) => void;
    const handleSubmit = vi.fn(
      () =>
        new Promise<Result<unknown>>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<TodoForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/título/i), "Comprar leche");

    const user = userEvent.setup();
    const clickPromise = user.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /guardando/i }),
      ).toBeDisabled();
    });

    resolveSubmit({ ok: true, value: undefined });
    await clickPromise;
  });

  it("muestra el error del servidor y conserva los valores si falla el guardado", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({
      ok: false,
      error: "No se pudo guardar la tarea.",
    });

    render(<TodoForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/título/i), "Comprar leche");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(
      await screen.findByText(/no se pudo guardar la tarea/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toHaveValue("Comprar leche");
  });
});
