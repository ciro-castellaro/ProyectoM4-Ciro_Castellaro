import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../../src/routes/AppRoutes";

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("AppRoutes", () => {
  it("muestra la pantalla de inicio de sesión en /login", () => {
    renderAt("/login");

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("muestra la pantalla de registro en /register", () => {
    renderAt("/register");

    expect(
      screen.getByRole("heading", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("muestra la pantalla de tareas en /tasks", () => {
    renderAt("/tasks");

    expect(
      screen.getByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
  });

  it("redirige la raíz a /login", () => {
    renderAt("/");

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("redirige una ruta desconocida a /login", () => {
    renderAt("/una-ruta-que-no-existe");

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });
});
