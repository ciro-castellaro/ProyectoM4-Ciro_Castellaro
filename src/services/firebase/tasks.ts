import {
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db, tasksCollection, taskFromDocument, TASKS_COLLECTION } from "./firestore";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import type { Task } from "../../types/task";
import type { Result } from "../../types/result";

export async function createTask(
  userId: string,
  values: { title: string; description: string },
): Promise<Result<Task>> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(tasksCollection, {
      userId,
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true,
      value: {
        id: docRef.id,
        userId,
        title: values.title,
        description: values.description,
        completed: false,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    };
  } catch (error) {
    return { ok: false, error: getFirestoreErrorMessage(error) };
  }
}

export async function getUserTasks(userId: string): Promise<Result<Task[]>> {
  try {
    // El `where` es obligatorio: las reglas de seguridad solo permiten un
    // `list` cuyo resultado se pueda verificar de antemano como "todas las
    // tareas de este usuario". Sin este filtro, Firestore rechaza la
    // consulta completa (no evalúa documento por documento en un `list`).
    const userTasksQuery = query(
      tasksCollection,
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(userTasksQuery);

    // Se ordena en el cliente (más reciente primero) para no depender de un
    // índice compuesto de Firestore solo para esto.
    const tasks = snapshot.docs
      .map((doc) => taskFromDocument(doc))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { ok: true, value: tasks };
  } catch (error) {
    return { ok: false, error: getFirestoreErrorMessage(error) };
  }
}

// Genérica a propósito: la usan tanto marcar como completada (pasando solo
// `completed`) como editar título/descripción, sin duplicar la misma llamada
// a Firestore para cada caso.
export async function updateTask(
  taskId: string,
  changes: Partial<Pick<Task, "title" | "description" | "completed">>,
): Promise<Result<void>> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...changes,
      updatedAt: Timestamp.now(),
    });

    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: getFirestoreErrorMessage(error) };
  }
}

export async function deleteTask(taskId: string): Promise<Result<void>> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);

    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: getFirestoreErrorMessage(error) };
  }
}
