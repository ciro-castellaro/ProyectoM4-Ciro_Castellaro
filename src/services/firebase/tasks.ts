import { addDoc, Timestamp } from "firebase/firestore";
import { tasksCollection } from "./firestore";
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
