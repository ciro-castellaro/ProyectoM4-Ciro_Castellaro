import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "../../src/pages/TasksPage/TasksPage";
import { useAuth } from "../../src/hooks/useAuth";
import { createTask as createTaskService } from "../../src/services/firebase/tasks";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/services/firebase/auth", () => ({
  logout: vi.fn(),
}));

vi.mock("../../src/services/firebase/tasks", () => ({
  createTask: vi.fn(),
}));

function renderTasksPage() {
  vi.mocked(useAuth).mockReturnValue({
    status: "success",
    data: { uid: "user-1", email: "usuario@matecode.com" } as never,
    error: null,
  });

  vi.mocked(createTaskService).mockImplementation(async (userId, values) => ({
    ok: true,
    value: {
      id: `mock-${values.title}`,
      userId,
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-01-10T12:00:00.000Z",
    },
  }));

  render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

async function createTaskInUI(title: string) {
  await userEvent.click(
    screen.getByRole("button", { name: /^nueva tarea$/i }),
  );
  await userEvent.type(screen.getByLabelText(/título/i), title);
  await userEvent.click(
    screen.getByRole("button", { name: /guardar tarea/i }),
  );
  await screen.findByText(title);
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(createTaskService).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("llama a createTask con el userId del usuario logueado", async () => {
    renderTasksPage();

    await createTaskInUI("Comprar leche");

    expect(createTaskService).toHaveBeenCalledWith("user-1", {
      title: "Comprar leche",
      description: "",
    });
  });

  it("agrega la tarea a la lista y actualiza el contador al crearla", async () => {
    renderTasksPage();

    await createTaskInUI("Comprar leche");

    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText(/1 tarea pendiente/i)).toBeInTheDocument();
  });

  it("muestra un error comprensible si Firestore rechaza la creación", async () => {
    renderTasksPage();
    vi.mocked(createTaskService).mockResolvedValue({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });

    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );
    await userEvent.type(screen.getByLabelText(/título/i), "Comprar leche");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(
      await screen.findByText(/no tenés permiso para realizar esta acción/i),
    ).toBeInTheDocument();
    // El formulario sigue abierto con los valores intactos, no se pierde el trabajo del usuario.
    expect(screen.getByLabelText(/título/i)).toHaveValue("Comprar leche");
  });

  it("marca una tarea como completada y actualiza el contador", async () => {
    renderTasksPage();
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByText(/0 tareas pendientes/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ completada/i)).toBeInTheDocument();
  });

  it("edita una tarea existente", async () => {
    renderTasksPage();
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    const titleInput = screen.getByLabelText(/título/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Comprar pan");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
    expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
  });

  it("elimina una tarea al confirmar, y vuelve a mostrar el estado vacío", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderTasksPage();
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /todavía no tenés tareas/i }),
    ).toBeInTheDocument();
  });
});
