import { FirebaseError } from "firebase/app";

// A diferencia de Firebase Auth, los códigos de error de Firestore no llevan
// prefijo (son "permission-denied", no "firestore/permission-denied").
const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "No tenés permiso para realizar esta acción.",
  unauthenticated: "Tu sesión expiró. Iniciá sesión de nuevo.",
  unavailable:
    "No se pudo conectar con el servidor. Revisá tu internet e intentá de nuevo.",
  "deadline-exceeded": "La operación tardó demasiado. Intentá de nuevo.",
  cancelled: "La operación fue cancelada.",
};

const DEFAULT_FIRESTORE_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Intentá de nuevo.";

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return FIRESTORE_ERROR_MESSAGES[error.code] ?? DEFAULT_FIRESTORE_ERROR_MESSAGE;
  }

  return DEFAULT_FIRESTORE_ERROR_MESSAGE;
}
