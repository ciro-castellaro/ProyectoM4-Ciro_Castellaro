import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "../../src/pages/RegisterPage/RegisterPage";
import { registerWithEmail } from "../../src/services/firebase/auth";

vi.mock("../../src/services/firebase/auth", () => ({
  registerWithEmail: vi.fn(),
}));

function renderRegisterPage() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

function renderRegisterPageWithTasksRoute() {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks" element={<h1>Mis tareas</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/email/i), "user@matecode.com");
  await userEvent.type(screen.getByLabelText(/contraseña/i), "123456");
  await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.mocked(registerWithEmail).mockReset();
  });

  it("muestra el título y el enlace hacia iniciar sesión", () => {
    renderRegisterPage();

    expect(
      screen.getByRole("heading", { name: /crear cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("muestra la marca y el mensaje del panel lateral", () => {
    renderRegisterPage();

    // "MateCode" aparece dos veces en el DOM: el wordmark compacto de mobile
    // y el del panel de escritorio. jsdom no evalúa media queries, así que
    // ambos existen en el árbol aunque en un navegador real solo se vea uno.
    expect(screen.getAllByText("MateCode").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", { name: /tus tareas.*en un solo lugar/is }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/organizá proyectos, completá tareas/i),
    ).toBeInTheDocument();
  });

  it("llama a registerWithEmail con los datos del formulario", async () => {
    vi.mocked(registerWithEmail).mockResolvedValue({
      ok: true,
      value: { uid: "abc123" } as never,
    });

    renderRegisterPage();
    await fillAndSubmit();

    expect(registerWithEmail).toHaveBeenCalledWith(
      "user@matecode.com",
      "123456",
    );
  });

  it("redirige a /tasks cuando el registro es exitoso", async () => {
    vi.mocked(registerWithEmail).mockResolvedValue({
      ok: true,
      value: { uid: "abc123" } as never,
    });

    renderRegisterPageWithTasksRoute();
    await fillAndSubmit();

    expect(
      await screen.findByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
  });

  it("muestra un error comprensible si el registro falla", async () => {
    vi.mocked(registerWithEmail).mockResolvedValue({
      ok: false,
      error: "Ya existe una cuenta registrada con este email.",
    });

    renderRegisterPage();
    await fillAndSubmit();

    expect(
      await screen.findByText(/ya existe una cuenta registrada/i),
    ).toBeInTheDocument();
  });
});
