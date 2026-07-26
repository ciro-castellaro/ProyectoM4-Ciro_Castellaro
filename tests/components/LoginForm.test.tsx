import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../../src/components/LoginForm";
import type { Result } from "../../src/types/result";

describe("LoginForm", () => {
  it("muestra los campos de email y contraseña", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("muestra errores de validación y no llama a onSubmit si el formulario es inválido", async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    expect(screen.getByText(/el email es obligatorio/i)).toBeInTheDocument();
    expect(
      screen.getByText(/la contraseña es obligatoria/i),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("acepta una contraseña corta (no aplica el mínimo de registro)", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({ ok: true, value: undefined });
    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "usuario@matecode.com",
    );
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123");
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "usuario@matecode.com",
      password: "123",
    });
  });

  it("llama a onSubmit con los valores saneados cuando el formulario es válido", async () => {
    const handleSubmit = vi
      .fn<(values: { email: string; password: string }) => Promise<Result<unknown>>>()
      .mockResolvedValue({ ok: true, value: undefined });

    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "  usuario@matecode.com  ",
    );
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "usuario@matecode.com",
      password: "123456",
    });
  });

  it("muestra un mensaje de carga mientras se procesa el inicio de sesión", async () => {
    let resolveSubmit!: (result: Result<unknown>) => void;
    const handleSubmit = vi.fn(
      () =>
        new Promise<Result<unknown>>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");

    const user = userEvent.setup();
    const clickPromise = user.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /iniciando sesión/i }),
      ).toBeDisabled();
    });

    resolveSubmit({ ok: true, value: undefined });
    await clickPromise;
  });

  it("muestra el error del servidor cuando el login falla", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({
      ok: false,
      error: "Email o contraseña incorrectos.",
    });

    render(<LoginForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "wrong-pass");
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    expect(
      await screen.findByText(/email o contraseña incorrectos/i),
    ).toBeInTheDocument();
  });
});
