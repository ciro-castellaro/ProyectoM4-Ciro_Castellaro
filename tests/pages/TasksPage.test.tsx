import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "../../src/pages/TasksPage/TasksPage";
import { useAuth } from "../../src/hooks/useAuth";
import {
  createTask as createTaskService,
  getUserTasks as getUserTasksService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
} from "../../src/services/firebase/tasks";
import { sendSummaryEmail as sendSummaryEmailService } from "../../src/services/email/sendSummary";
import type { Task } from "../../src/types/task";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/services/firebase/auth", () => ({
  logout: vi.fn(),
}));

vi.mock("../../src/services/firebase/tasks", () => ({
  createTask: vi.fn(),
  getUserTasks: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("../../src/services/email/sendSummary", () => ({
  sendSummaryEmail: vi.fn(),
}));

// Simula una "base de datos" en memoria: crear agrega acá, y la consulta de
// listado (que dispara handleCreateTask via refetch) lee de acá. Así los
// tests reflejan el flujo real: crear -> refetch -> aparece en la lista.
let fakeTasksDb: Task[] = [];

function renderTasksPage() {
  fakeTasksDb = [];

  vi.mocked(useAuth).mockReturnValue({
    status: "success",
    data: {
      uid: "user-1",
      email: "usuario@matecode.com",
      getIdToken: vi.fn().mockResolvedValue("fake-id-token"),
    } as never,
    error: null,
  });

  vi.mocked(sendSummaryEmailService).mockResolvedValue({
    ok: true,
    value: { message: "Resumen enviado." },
  });

  vi.mocked(createTaskService).mockImplementation(async (userId, values) => {
    const newTask: Task = {
      id: `mock-${values.title}`,
      userId,
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-01-10T12:00:00.000Z",
    };
    fakeTasksDb = [newTask, ...fakeTasksDb];
    return { ok: true, value: newTask };
  });

  vi.mocked(getUserTasksService).mockImplementation(async () => ({
    ok: true,
    value: fakeTasksDb,
  }));

  vi.mocked(updateTaskService).mockImplementation(async (taskId, changes) => {
    fakeTasksDb = fakeTasksDb.map((task) =>
      task.id === taskId ? { ...task, ...changes } : task,
    );
    return { ok: true, value: undefined };
  });

  vi.mocked(deleteTaskService).mockImplementation(async (taskId) => {
    fakeTasksDb = fakeTasksDb.filter((task) => task.id !== taskId);
    return { ok: true, value: undefined };
  });

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
    vi.mocked(getUserTasksService).mockReset();
    vi.mocked(updateTaskService).mockReset();
    vi.mocked(deleteTaskService).mockReset();
    vi.mocked(sendSummaryEmailService).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el título, el contador de pendientes y el estado vacío", async () => {
    renderTasksPage();

    expect(
      screen.getByRole("heading", { name: /mis tareas/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /todavía no tenés tareas/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/0 tareas pendientes/i)).toBeInTheDocument();
  });

  it("consulta las tareas del usuario logueado al cargar la pantalla", async () => {
    renderTasksPage();

    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });

    expect(getUserTasksService).toHaveBeenCalledWith("user-1");
  });

  it("muestra un error comprensible si Firestore rechaza la consulta", async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "success",
      data: { uid: "user-1", email: "usuario@matecode.com" } as never,
      error: null,
    });
    vi.mocked(getUserTasksService).mockResolvedValue({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/no tenés permiso para realizar esta acción/i),
    ).toBeInTheDocument();
  });

  it("muestra el formulario al hacer clic en 'Nueva tarea', y lo oculta al cancelar", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });

    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });

  it("también abre el formulario desde el botón del estado vacío", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });

    await userEvent.click(
      screen.getByRole("button", { name: /crear mi primera tarea/i }),
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it("llama a createTask con el userId del usuario logueado", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });

    await createTaskInUI("Comprar leche");

    expect(createTaskService).toHaveBeenCalledWith("user-1", {
      title: "Comprar leche",
      description: "",
    });
  });

  it("agrega la tarea creada a la lista sin volver a consultar toda la colección", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });

    await createTaskInUI("Comprar leche");

    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText(/1 tarea pendiente/i)).toBeInTheDocument();
    // Solo la consulta inicial al montar: crear no debe disparar otra, para
    // no repetir el parpadeo de "Cargando tareas..." por un solo documento.
    expect(getUserTasksService).toHaveBeenCalledTimes(1);
  });

  it("muestra un error comprensible si Firestore rechaza la creación", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
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

  it("marca una tarea como completada en Firestore y actualiza el contador", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("checkbox"));

    expect(updateTaskService).toHaveBeenCalledWith("mock-Comprar leche", {
      completed: true,
    });
    expect(await screen.findByText(/✓ completada/i)).toBeInTheDocument();
    expect(screen.getByText(/0 tareas pendientes/i)).toBeInTheDocument();
    // Regresión: completar no debe volver a consultar toda la colección
    // (eso causaba un parpadeo de "Cargando tareas..." por cada click).
    expect(getUserTasksService).toHaveBeenCalledTimes(1);
  });

  it("muestra un error comprensible si Firestore rechaza el cambio de estado", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");
    vi.mocked(updateTaskService).mockResolvedValue({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });

    await userEvent.click(screen.getByRole("checkbox"));

    expect(
      await screen.findByText(/no tenés permiso para realizar esta acción/i),
    ).toBeInTheDocument();
  });

  it("edita una tarea existente en Firestore", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    const titleInput = screen.getByLabelText(/título/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Comprar pan");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(updateTaskService).toHaveBeenCalledWith("mock-Comprar leche", {
      title: "Comprar pan",
      description: "",
    });
    expect(await screen.findByText("Comprar pan")).toBeInTheDocument();
    expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
    // Mismo criterio que crear/completar: no debe releer toda la colección.
    expect(getUserTasksService).toHaveBeenCalledTimes(1);
  });

  it("muestra un error comprensible y mantiene el formulario abierto si falla la edición", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");
    vi.mocked(updateTaskService).mockResolvedValue({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });

    await userEvent.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /guardar tarea/i }),
    );

    expect(
      await screen.findByText(/no tenés permiso para realizar esta acción/i),
    ).toBeInTheDocument();
    // Sigue en modo edición: no se perdió el trabajo del usuario.
    expect(screen.getByLabelText(/título/i)).toHaveValue("Comprar leche");
  });

  it("elimina una tarea en Firestore al confirmar en el modal, y vuelve a mostrar el estado vacío", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^eliminar$/i }),
    );

    expect(deleteTaskService).toHaveBeenCalledWith("mock-Comprar leche");
    expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /todavía no tenés tareas/i }),
    ).toBeInTheDocument();
    // Mismo criterio que crear/completar/editar: no debe releer toda la colección.
    expect(getUserTasksService).toHaveBeenCalledTimes(1);
  });

  it("no elimina la tarea si se cancela en el modal", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(deleteTaskService).not.toHaveBeenCalled();
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
  });

  it("muestra un error comprensible si Firestore rechaza la eliminación", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");
    vi.mocked(deleteTaskService).mockResolvedValue({
      ok: false,
      error: "No tenés permiso para realizar esta acción.",
    });

    await userEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^eliminar$/i }),
    );

    expect(
      await screen.findByText(/no tenés permiso para realizar esta acción/i),
    ).toBeInTheDocument();
    // La tarea sigue en la lista: no se borró localmente sin confirmación real.
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
  });

  it("no permite tener abiertos a la vez el formulario de creación y el de edición", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");

    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );
    expect(screen.getByRole("heading", { name: /^nueva tarea$/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/título/i)).toHaveLength(1);

    // Abrir la edición de una tarea existente debe cerrar el formulario de
    // creación: de lo contrario habría dos campos con el mismo id en el DOM.
    await userEvent.click(screen.getByRole("button", { name: /editar/i }));
    expect(
      screen.queryByRole("heading", { name: /^nueva tarea$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/título/i)).toHaveLength(1);

    // Y a la inversa: abrir "Nueva tarea" mientras se edita debe cerrar la edición.
    await userEvent.click(
      screen.getByRole("button", { name: /^nueva tarea$/i }),
    );
    expect(screen.getByRole("heading", { name: /^nueva tarea$/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/título/i)).toHaveLength(1);
  });

  it("envía el resumen con el idToken del usuario y los contadores actuales", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    await createTaskInUI("Comprar leche");
    await createTaskInUI("Lavar el auto");

    await userEvent.click(
      screen.getByRole("button", { name: /enviar resumen por email/i }),
    );

    expect(
      await screen.findByText(/te enviamos un resumen a tu email/i),
    ).toBeInTheDocument();
    expect(sendSummaryEmailService).toHaveBeenCalledWith(
      "fake-id-token",
      expect.objectContaining({
        total: 2,
        pending: 2,
        completed: 0,
        pendingTitles: ["Lavar el auto", "Comprar leche"],
        completedTitles: [],
      }),
    );
  });

  it("muestra un error comprensible si falla el envío del resumen", async () => {
    renderTasksPage();
    await screen.findByRole("heading", { name: /todavía no tenés tareas/i });
    vi.mocked(sendSummaryEmailService).mockResolvedValue({
      ok: false,
      error: "No se pudo enviar el resumen.",
    });

    await userEvent.click(
      screen.getByRole("button", { name: /enviar resumen por email/i }),
    );

    expect(
      await screen.findByText(/no se pudo enviar el resumen/i),
    ).toBeInTheDocument();
  });
});
