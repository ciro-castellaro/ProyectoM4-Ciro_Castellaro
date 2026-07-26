import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoForm from "../../src/components/TodoForm/TodoForm";

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
    const handleSubmit = vi.fn();
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
    expect(screen.getByLabelText(/título/i)).toHaveValue("");
    expect(screen.getByLabelText(/descripción/i)).toHaveValue("");
  });

  it("acepta una descripción vacía", async () => {
    const handleSubmit = vi.fn();
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
});
