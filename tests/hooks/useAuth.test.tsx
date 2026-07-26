import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import type { User } from "firebase/auth";
import { AuthProvider, useAuth } from "../../src/hooks/useAuth";
import { subscribeToAuthChanges } from "../../src/services/firebase/auth";

vi.mock("../../src/services/firebase/auth", () => ({
  subscribeToAuthChanges: vi.fn(),
}));

function AuthStateProbe() {
  const { status, data, error } = useAuth();

  return (
    <p>
      status:{status} user:{data ? data.uid : "none"} error:{error ?? "none"}
    </p>
  );
}

describe("AuthProvider / useAuth", () => {
  beforeEach(() => {
    vi.mocked(subscribeToAuthChanges).mockReset();
  });

  it("empieza en estado de carga antes de que Firebase resuelva la sesión", () => {
    vi.mocked(subscribeToAuthChanges).mockReturnValue(vi.fn());

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(screen.getByText(/status:loading/)).toBeInTheDocument();
  });

  it("pasa a success con el usuario cuando hay sesión activa", async () => {
    let emitAuthChange: (user: User | null) => void = () => {};
    vi.mocked(subscribeToAuthChanges).mockImplementation((callback) => {
      emitAuthChange = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    act(() => {
      emitAuthChange({ uid: "user-1" } as User);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/status:success user:user-1 error:none/),
      ).toBeInTheDocument();
    });
  });

  it("pasa a success sin usuario cuando no hay sesión activa", async () => {
    let emitAuthChange: (user: User | null) => void = () => {};
    vi.mocked(subscribeToAuthChanges).mockImplementation((callback) => {
      emitAuthChange = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    act(() => {
      emitAuthChange(null);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/status:success user:none error:none/),
      ).toBeInTheDocument();
    });
  });

  it("se desuscribe de los cambios de auth al desmontarse", () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeToAuthChanges).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("lanza un error claro si se usa fuera de AuthProvider", () => {
    expect(() => render(<AuthStateProbe />)).toThrow(
      /useAuth debe usarse dentro de un AuthProvider/,
    );
  });
});
