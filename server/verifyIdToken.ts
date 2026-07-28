import type { Result } from "../src/types/result";
import { getAdminAuth } from "./firebaseAdmin";

export interface VerifiedUser {
  uid: string;
  email: string;
}

export async function verifyIdToken(
  idToken: string,
): Promise<Result<VerifiedUser>> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    if (!decoded.email) {
      return { ok: false, error: "El token no tiene un email asociado." };
    }

    return { ok: true, value: { uid: decoded.uid, email: decoded.email } };
  } catch (error) {
    // Se loguea server-side (nunca al cliente) para poder distinguir un token
    // realmente inválido/expirado de un error de configuración (p. ej. faltan
    // las variables de entorno de la service account) al revisar los logs.
    console.error("[verifyIdToken] Falló la verificación:", error);
    return {
      ok: false,
      error: "El token de autenticación es inválido o expiró.",
    };
  }
}
