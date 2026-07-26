import { FirebaseError } from "firebase/app";

// auth/user-not-found y auth/wrong-password son códigos legacy; el SDK actual
// de Firebase devuelve auth/invalid-credential para ambos casos (no revela si
// el email existe o la contraseña es incorrecta). Se mapean los tres al mismo
// mensaje genérico por consistencia y por seguridad.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "Ya existe una cuenta registrada con este email.",
  "auth/invalid-email": "El email no tiene un formato válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada.",
  "auth/operation-not-allowed":
    "El inicio de sesión por email y contraseña no está habilitado para este proyecto.",
  "auth/too-many-requests":
    "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
  "auth/network-request-failed":
    "Error de conexión. Revisá tu internet e intentá de nuevo.",
};

const DEFAULT_AUTH_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Intentá de nuevo.";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_AUTH_ERROR_MESSAGE;
  }

  return DEFAULT_AUTH_ERROR_MESSAGE;
}
