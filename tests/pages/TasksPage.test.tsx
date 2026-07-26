import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "../../src/pages/TasksPage/TasksPage";
import { useAuth } from "../../src/hooks/useAuth";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/services/firebase/auth", () => ({
  logout: vi.fn(),
}));

function renderTasksPage() {
  vi.mocked(useAuth).mockReturnValue({
    status: "success",
    data: { email: "usuario@matecode.com" } as never,
    error: null,
  });

  render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("muestra el título, el contador de pendientes y el estado vacío", () => {
    renderTasksPage();

    expect(
      screen.getByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/0 tareas pendientes/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /todavía no tenés tareas/i }),
    ).toBeInTheDocument();
  });

  it("muestra el formulario al hacer clic en 'Nueva tarea', y lo oculta al cancelar", async () => {
    renderTasksPage();

    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });

  it("también abre el formulario desde el botón del estado vacío", async () => {
    renderTasksPage();

    await userEvent.click(
      screen.getByRole("button", { name: /crear mi primera tarea/i }),
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it("muestra una confirmación y cierra el formulario al crear una tarea válida", async () => {
    renderTasksPage();

    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );
    await userEvent.type(screen.getByLabelText(/título/i), "Comprar leche");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      /comprar leche/i,
    );
    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });
});
