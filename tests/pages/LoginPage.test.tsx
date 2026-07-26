import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../../src/pages/LoginPage/LoginPage";
import { loginWithEmail } from "../../src/services/firebase/auth";

vi.mock("../../src/services/firebase/auth", () => ({
  loginWithEmail: vi.fn(),
}));

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

function renderLoginPageWithTasksRoute() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks" element={<h1>Mis tareas</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
  await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
  await userEvent.click(
    screen.getByRole("button", { name: /iniciar sesión/i }),
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(loginWithEmail).mockReset();
  });

  it("muestra el título y el enlace hacia crear cuenta", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
  });

  it("llama a loginWithEmail con los datos del formulario", async () => {
    vi.mocked(loginWithEmail).mockResolvedValue({
      ok: true,
      value: { uid: "abc123" } as never,
    });

    renderLoginPage();
    await fillAndSubmit();

    expect(loginWithEmail).toHaveBeenCalledWith(
      "user@matecode.com",
      "123456",
    );
  });

  it("redirige a /tasks cuando el login es exitoso", async () => {
    vi.mocked(loginWithEmail).mockResolvedValue({
      ok: true,
      value: { uid: "abc123" } as never,
    });

    renderLoginPageWithTasksRoute();
    await fillAndSubmit();

    expect(
      await screen.findByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
  });

  it("muestra un error comprensible si el login falla", async () => {
    vi.mocked(loginWithEmail).mockResolvedValue({
      ok: false,
      error: "Email o contraseña incorrectos.",
    });

    renderLoginPage();
    await fillAndSubmit();

    expect(
      await screen.findByText(/email o contraseña incorrectos/i),
    ).toBeInTheDocument();
  });
});
