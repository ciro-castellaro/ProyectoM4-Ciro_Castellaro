import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types/task";
import type { AsyncState } from "../types/async";
import { getUserTasks } from "../services/firebase/tasks";

export function useTasks(userId: string | undefined) {
  const [tasksState, setTasksState] = useState<AsyncState<Task[]>>({
    status: "loading",
    data: null,
    error: null,
  });

  const refetch = useCallback(() => {
    if (!userId) {
      return;
    }

    setTasksState((prev) => ({ ...prev, status: "loading" }));

    getUserTasks(userId).then((result) => {
      if (result.ok) {
        setTasksState({ status: "success", data: result.value, error: null });
      } else {
        setTasksState({ status: "error", data: null, error: result.error });
      }
    });
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tasksState, setTasksState, refetch };
}
