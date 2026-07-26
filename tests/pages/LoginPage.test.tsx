import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../src/pages/LoginPage";

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("muestra el título y el enlace hacia crear cuenta", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("muestra una confirmación visual al completar el formulario correctamente", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
    await userEvent.click(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /formulario válido/i,
    );
  });
});
