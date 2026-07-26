import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TasksPage from "../../src/pages/TasksPage";
import { logout } from "../../src/services/firebase/auth";

vi.mock("../../src/services/firebase/auth", () => ({
  logout: vi.fn(),
}));

function renderTasksPageWithLoginRoute() {
  render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <Routes>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/login" element={<h1>Iniciar sesión</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset();
  });

  it("muestra el botón de cerrar sesión", () => {
    renderTasksPageWithLoginRoute();

    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
  });

  it("redirige a /login cuando el logout es exitoso", async () => {
    vi.mocked(logout).mockResolvedValue({ ok: true, value: undefined });

    renderTasksPageWithLoginRoute();
    await userEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("muestra un error comprensible si el logout falla", async () => {
    vi.mocked(logout).mockResolvedValue({
      ok: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    });

    renderTasksPageWithLoginRoute();
    await userEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    );

    expect(
      await screen.findByText(/ocurrió un error inesperado/i),
    ).toBeInTheDocument();
  });
});
