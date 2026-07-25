import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../../src/components/RegisterForm";

describe("RegisterForm", () => {
  it("muestra los campos de email y contraseña", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("muestra errores de validación y no llama a onSubmit si el formulario es inválido", async () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);

    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    expect(screen.getByText(/el email es obligatorio/i)).toBeInTheDocument();
    expect(
      screen.getByText(/la contraseña es obligatoria/i),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("llama a onSubmit con los valores saneados cuando el formulario es válido", async () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "  usuario@matecode.com  ",
    );
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "usuario@matecode.com",
      password: "123456",
    });
  });
});
