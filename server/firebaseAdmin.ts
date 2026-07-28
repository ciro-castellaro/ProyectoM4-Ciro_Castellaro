import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedAuth: Auth | undefined;

// Vercel reutiliza la instancia del proceso entre invocaciones de la misma
// función "caliente"; inicializar la app de firebase-admin una sola vez evita
// el error "app already exists" y reconstruir la conexión en cada request.
export function getAdminAuth(): Auth {
  if (cachedAuth) {
    return cachedAuth;
  }

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    );

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Faltan variables de entorno de la service account de Firebase " +
          "(FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY).",
      );
    }

    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  cachedAuth = getAuth();
  return cachedAuth;
}
