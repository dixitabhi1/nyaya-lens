import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authLogin, authLogout, authMe, authRegister } from "@/services/api";
import {
  clearAuthSession,
  getAuthToken,
  getStoredAuthUser,
  persistAuthSession,
  type AuthUser,
} from "@/lib/auth-storage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; full_name: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await authMe();
        if (cancelled) return;
        setUser(me);
        persistAuthSession(token, me);
      } catch {
        if (cancelled) return;
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email: string, password: string) {
    const response = await authLogin({ email, password });
    persistAuthSession(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }

  async function register(payload: {
    email: string;
    full_name: string;
    password: string;
    role?: string;
  }) {
    const response = await authRegister(payload);
    persistAuthSession(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
  }

  async function logout() {
    try {
      if (token) {
        await authLogout();
      }
    } finally {
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
