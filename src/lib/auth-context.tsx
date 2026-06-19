"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthUser } from "./types";
import {
  api,
  ApiError,
  getCustomerToken,
  setCustomerToken,
  clearCustomerToken,
} from "./api";

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api<{ user: AuthUser }>("/customer/me", {
        customerAuth: true,
      });
      setUser(res.user);
    } catch {
      clearCustomerToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(email: string, password: string) {
    const res = await api<{ token: string; user: AuthUser }>("/customer/login", {
      method: "POST",
      body: { email, password },
    });
    setCustomerToken(res.token);
    setUser(res.user);
  }

  async function register(data: RegisterData) {
    const res = await api<{ token: string; user: AuthUser }>(
      "/customer/register",
      { method: "POST", body: data },
    );
    setCustomerToken(res.token);
    setUser(res.user);
  }

  async function logout() {
    try {
      await api("/customer/logout", {
        method: "POST",
        customerAuth: true,
      });
    } catch {
      // ignore — token may already be invalid
    }
    clearCustomerToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
