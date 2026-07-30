import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTasks } from "../../src/hooks/useTasks";
import { getUserTasks } from "../../src/services/firebase/tasks";
import type { Task } from "../../src/types/task";

vi.mock("../../src/services/firebase/tasks", () => ({
  getUserTasks: vi.fn(),
}));

const task: Task = {
  id: "task-1",
  userId: "user-1",
  title: "Comprar leche",
  description: "1 litro",
  completed: false,
  priority: "medium",
  dueDate: null,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-10T12:00:00.000Z",
};

describe("useTasks", () => {
  beforeEach(() => {
    vi.mocked(getUserTasks).mockReset();
  });

  it("no consulta nada si todavía no hay userId", () => {
    const { result } = renderHook(() => useTasks(undefined));

    expect(getUserTasks).not.toHaveBeenCalled();
    expect(result.current.tasksState.status).toBe("loading");
  });

  it("empieza en loading y pasa a success con las tareas del usuario", async () => {
    vi.mocked(getUserTasks).mockResolvedValue({ ok: true, value: [task] });

    const { result } = renderHook(() => useTasks("user-1"));

    expect(result.current.tasksState.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.tasksState.status).toBe("success");
    });

    expect(result.current.tasksState.data).toEqual([task]);
    expect(getUserTasks).toHaveBeenCalledWith("user-1");
  });

  it("pasa a error si la consulta falla", async () => {
    vi.mocked(getUserTasks).mockResolvedValue({
      ok: false,
      error: "No se pudieron cargar las tareas.",
    });

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => {
      expect(result.current.tasksState.status).toBe("error");
    });

    expect(result.current.tasksState.error).toBe(
      "No se pudieron cargar las tareas.",
    );
  });

  it("refetch vuelve a consultar las tareas", async () => {
    vi.mocked(getUserTasks).mockResolvedValue({ ok: true, value: [task] });

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => {
      expect(result.current.tasksState.status).toBe("success");
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(getUserTasks).toHaveBeenCalledTimes(2);
    });
  });

  it("permite mutar el estado localmente con setTasksState", async () => {
    vi.mocked(getUserTasks).mockResolvedValue({ ok: true, value: [task] });

    const { result } = renderHook(() => useTasks("user-1"));

    await waitFor(() => {
      expect(result.current.tasksState.status).toBe("success");
    });

    act(() => {
      result.current.setTasksState((prev) => ({
        ...prev,
        data: (prev.data ?? []).map((t) => ({ ...t, completed: true })),
      }));
    });

    expect(result.current.tasksState.data?.[0].completed).toBe(true);
  });
});
