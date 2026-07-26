import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../src/routes/ProtectedRoute";
import { useAuth } from "../../src/hooks/useAuth";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <Routes>
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <h1>Mis tareas</h1>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<h1>Iniciar sesión</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("muestra un estado de carga mientras se resuelve la sesión", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "loading",
      data: null,
      error: null,
    });

    renderProtectedRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /mis tareas/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /iniciar sesión/i }),
    ).not.toBeInTheDocument();
  });

  it("redirige a /login si no hay usuario autenticado (acceso no autorizado)", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: null,
      error: null,
    });

    renderProtectedRoute();

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /mis tareas/i }),
    ).not.toBeInTheDocument();
  });

  it("muestra el contenido protegido si hay un usuario autenticado (acceso autorizado)", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: { uid: "user-1" } as never,
      error: null,
    });

    renderProtectedRoute();

    expect(
      screen.getByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
  });
});
