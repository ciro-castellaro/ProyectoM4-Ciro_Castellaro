import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../../src/pages/RegisterPage";

function renderRegisterPage() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  it("muestra el título y el enlace hacia iniciar sesión", () => {
    renderRegisterPage();

    expect(
      screen.getByRole("heading", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("muestra una confirmación visual al completar el formulario correctamente", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: /crear cuenta/i }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /formulario válido/i,
    );
  });
});
