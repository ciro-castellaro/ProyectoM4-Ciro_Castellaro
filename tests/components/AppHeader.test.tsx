import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppHeader from "../../src/components/AppHeader";
import { useAuth } from "../../src/hooks/useAuth";
import { logout } from "../../src/services/firebase/auth";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/services/firebase/auth", () => ({
  logout: vi.fn(),
}));

function renderAppHeader() {
  render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <Routes>
        <Route path="/tasks" element={<AppHeader />} />
        <Route path="/login" element={<h1>Iniciar sesión</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppHeader", () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset();
  });

  it("muestra el nombre de la app y el email del usuario", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: { email: "usuario@matecode.com" } as never,
      error: null,
    });

    renderAppHeader();

    expect(screen.getByText("MateCode")).toBeInTheDocument();
    expect(screen.getByText("usuario@matecode.com")).toBeInTheDocument();
  });

  it("redirige a /login cuando el logout es exitoso", async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: { email: "usuario@matecode.com" } as never,
      error: null,
    });
    vi.mocked(logout).mockResolvedValue({ ok: true, value: undefined });

    renderAppHeader();
    await userEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("muestra un error comprensible si el logout falla", async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: { email: "usuario@matecode.com" } as never,
      error: null,
    });
    vi.mocked(logout).mockResolvedValue({
      ok: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    });

    renderAppHeader();
    await userEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    );

    expect(
      await screen.findByText(/ocurrió un error inesperado/i),
    ).toBeInTheDocument();
  });
});
