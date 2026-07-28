import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";
import type { Result } from "../../src/types/result";

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

  it("muestra un error de validación si la contraseña tiene menos de 6 caracteres", async () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "usuario@matecode.com",
    );
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    expect(
      screen.getByText(/la contraseña debe tener al menos 6 caracteres/i),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("llama a onSubmit con los valores saneados cuando el formulario es válido", async () => {
    const handleSubmit = vi
      .fn<(values: { email: string; password: string }) => Promise<Result<unknown>>>()
      .mockResolvedValue({ ok: true, value: undefined });

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

  it("muestra un mensaje de carga mientras se procesa el registro", async () => {
    let resolveSubmit!: (result: Result<unknown>) => void;
    const handleSubmit = vi.fn(
      () =>
        new Promise<Result<unknown>>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<RegisterForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");

    const user = userEvent.setup();
    const clickPromise = user.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /creando cuenta/i }),
      ).toBeDisabled();
    });

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();

    resolveSubmit({ ok: true, value: undefined });
    await clickPromise;
  });

  it("muestra el error del servidor cuando el registro falla", async () => {
    const handleSubmit = vi.fn().mockResolvedValue({
      ok: false,
      error: "Ya existe una cuenta registrada con este email.",
    });

    render(<RegisterForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    expect(
      await screen.findByText(/ya existe una cuenta registrada/i),
    ).toBeInTheDocument();
  });
});
