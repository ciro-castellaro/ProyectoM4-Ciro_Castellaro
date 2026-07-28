import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  subscribeToAuthChanges,
} from "../../../src/services/firebase/auth";

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/auth")>();
  return {
    ...actual,
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  };
});

const fakeUser = { uid: "user-1", email: "user@example.com" } as User;

describe("registerWithEmail", () => {
  beforeEach(() => {
    vi.mocked(createUserWithEmailAndPassword).mockReset();
  });

  it("devuelve el usuario creado cuando Firebase acepta el registro", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: fakeUser,
    } as never);

    const result = await registerWithEmail("user@example.com", "123456");

    expect(result).toEqual({ ok: true, value: fakeUser });
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "123456",
    );
  });

  it("devuelve un error comprensible si Firebase rechaza el registro", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/email-already-in-use", "msg"),
    );

    const result = await registerWithEmail("user@example.com", "123456");

    expect(result).toEqual({
      ok: false,
      error: "Ya existe una cuenta registrada con este email.",
    });
  });
});

describe("loginWithEmail", () => {
  beforeEach(() => {
    vi.mocked(signInWithEmailAndPassword).mockReset();
  });

  it("devuelve el usuario cuando Firebase acepta las credenciales", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: fakeUser,
    } as never);

    const result = await loginWithEmail("user@example.com", "123456");

    expect(result).toEqual({ ok: true, value: fakeUser });
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "123456",
    );
  });

  it("devuelve un error comprensible si Firebase rechaza las credenciales", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "msg"),
    );

    const result = await loginWithEmail("user@example.com", "wrong-password");

    expect(result).toEqual({
      ok: false,
      error: "Email o contraseña incorrectos.",
    });
  });
});

describe("logout", () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset();
  });

  it("cierra la sesión sin errores", async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);

    const result = await logout();

    expect(result).toEqual({ ok: true, value: undefined });
    expect(signOut).toHaveBeenCalledWith(expect.anything());
  });

  it("devuelve un error comprensible si Firebase rechaza el cierre de sesión", async () => {
    vi.mocked(signOut).mockRejectedValue(
      new FirebaseError("auth/network-request-failed", "msg"),
    );

    const result = await logout();

    expect(result).toEqual({
      ok: false,
      error: "Error de conexión. Revisá tu internet e intentá de nuevo.",
    });
  });
});

describe("subscribeToAuthChanges", () => {
  it("se suscribe a los cambios de sesión de Firebase y devuelve la función de desuscripción", () => {
    const unsubscribe = vi.fn();
    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);
    const callback = vi.fn();

    const result = subscribeToAuthChanges(callback);

    expect(onAuthStateChanged).toHaveBeenCalledWith(
      expect.anything(),
      callback,
    );
    expect(result).toBe(unsubscribe);
  });
});
