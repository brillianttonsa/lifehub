import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type AuthUser } from "@/services/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithGoogleCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getMessage(e: unknown, fallback: string) {
  const anyE = e as any;
  return anyE?.response?.data?.message || anyE?.message || fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstrap: try to fetch the current user. If unauthenticated, silently end.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await authService.me();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setError(null);
      try {
        const u = await authService.signup(email, password, fullName);
        setUser(u);
      } catch (e) {
        const msg = getMessage(e, "Signup failed");
        setError(msg);
        throw new Error(msg);
      }
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const u = await authService.login(email, password);
      setUser(u);
    } catch (e) {
      const msg = getMessage(e, "Invalid email or password");
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    setError(null);
    try {
      const u = await authService.loginWithGoogle(token);
      setUser(u);
    } catch (e) {
      const msg = getMessage(e, "Google authentication failed");
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginWithGoogleCode = useCallback(async (code: string) => {
    setError(null);
    try {
      const u = await authService.loginWithGoogleCode(code);
      setUser(u);
    } catch (e) {
      const msg = getMessage(e, "Google authentication failed");
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      signup,
      login,
      loginWithGoogle,
      loginWithGoogleCode,
      logout,
      clearError: () => setError(null),
      setUser,
    }),
    [user, loading, error, signup, login, loginWithGoogle, loginWithGoogleCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
