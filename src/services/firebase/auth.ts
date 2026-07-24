import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { firebaseApp } from "./config";
import { getAuthErrorMessage } from "./authErrors";
import type { Result } from "../../types/result";

export const auth = getAuth(firebaseApp);

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<Result<User>> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { ok: true, value: credential.user };
  } catch (error) {
    return { ok: false, error: getAuthErrorMessage(error) };
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<Result<User>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, value: credential.user };
  } catch (error) {
    return { ok: false, error: getAuthErrorMessage(error) };
  }
}

export async function logout(): Promise<Result<void>> {
  try {
    await signOut(auth);
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: getAuthErrorMessage(error) };
  }
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
