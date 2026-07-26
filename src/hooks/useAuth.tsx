import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthChanges } from "../services/firebase/auth";
import type { AsyncState } from "../types/async";

const AuthContext = createContext<AsyncState<User | null> | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AsyncState<User | null>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setAuthState({ status: "success", data: user, error: null });
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AsyncState<User | null> {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }

  return context;
}
