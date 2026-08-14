import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../api/auth";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../api/client";
import type { LoginInput, RegisterInput, User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already stored, validate it against
  // /v1/auth/me rather than trusting it blindly.
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
      .then(setUser)
      .catch(() => clearStoredToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (input: LoginInput) => {
    const { access_token } = await loginUser(input);
    setStoredToken(access_token);
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  };

  const register = async (input: RegisterInput) => {
    // /register only creates the account and returns the user - it doesn't
    // issue a token, so log in with the same credentials right after to
    // get the user signed in immediately.
    await registerUser(input);
    await login({ email: input.email, password: input.password });
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
