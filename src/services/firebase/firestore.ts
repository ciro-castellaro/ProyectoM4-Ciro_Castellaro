import {
  getFirestore,
  collection,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import type { Task } from "../../types/task";

export const db = getFirestore(firebaseApp);

export const TASKS_COLLECTION = "tasks";
export const tasksCollection = collection(db, TASKS_COLLECTION);

// Forma en la que se guarda una tarea en Firestore: igual a `Task`, pero sin
// `id` (es la clave del documento, no un campo del documento) y con las
// fechas como `Timestamp` de Firestore en vez de string ISO.
export type TaskDocumentData = Omit<Task, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export function taskFromDocument(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Task {
  const data = snapshot.data() as TaskDocumentData;

  return {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    completed: data.completed,
    // `?? ...`: tareas creadas antes de agregar estos campos no los tienen
    // en Firestore, aunque el tipo `TaskDocumentData` diga que sí.
    priority: data.priority ?? "medium",
    dueDate: data.dueDate ?? null,
    // Tareas creadas antes de agregar orden manual no tienen `order`: se usa
    // su fecha de creación como posición, así se preserva el orden que ya
    // tenían (más nuevas primero) sin necesidad de migrar datos viejos.
    order: data.order ?? data.createdAt.toMillis(),
    createdAt: data.createdAt.toDate().toISOString(),
    updatedAt: data.updatedAt.toDate().toISOString(),
  };
}
