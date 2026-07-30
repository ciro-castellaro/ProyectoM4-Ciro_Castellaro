import {
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db, tasksCollection, taskFromDocument, TASKS_COLLECTION } from "./firestore";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import type { Task } from "../../types/task";
import type { Result } from "../../types/result";

export async function createTask(
  userId: string,
  values: {
    title: string;
    description: string;
    priority: Task["priority"];
    dueDate: string | null;
  },
): Promise<Result<Task>> {
  try {
    const now = Timestamp.now();
    // Mismo valor que se usaría por defecto al leer una tarea vieja sin
    // `order` (`createdAt` en milisegundos): así una tarea recién creada
    // queda ordenada de forma consistente con las demás sin casos especiales.
    const order = now.toMillis();
    const docRef = await addDoc(tasksCollection, {
      userId,
      title: values.title,
      description: values.description,
      completed: false,
      priority: values.priority,
      dueDate: values.dueDate,
      order,
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
        priority: values.priority,
        dueDate: values.dueDate,
        order,
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

    // Se ordena en el cliente (por `order` descendente: más alto primero) para
    // no depender de un índice compuesto de Firestore solo para esto. Por
    // defecto `order` coincide con la fecha de creación, así que sin
    // reordenar a mano el resultado es el mismo de siempre (más reciente
    // primero); al arrastrar una tarea, `order` pasa a reflejar el orden manual.
    const tasks = snapshot.docs
      .map((doc) => taskFromDocument(doc))
      .sort((a, b) => b.order - a.order);

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
  changes: Partial<
    Pick<Task, "title" | "description" | "completed" | "priority" | "dueDate">
  >,
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

// Recibe las tareas ya en su nuevo orden visual (de arriba hacia abajo) y
// reescribe el `order` de todas en un solo batch, de mayor a menor: la de
// arriba queda con el valor más alto. Se reescriben todas de una porque el
// arrastre solo está habilitado cuando se ven todas las tareas sin filtrar
// (ver TodoList), así que siempre es la lista completa del usuario.
export async function updateTasksOrder(tasks: Task[]): Promise<Result<void>> {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const base = now.toMillis();

    tasks.forEach((task, index) => {
      const taskRef = doc(db, TASKS_COLLECTION, task.id);
      batch.update(taskRef, { order: base - index, updatedAt: now });
    });

    await batch.commit();

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
