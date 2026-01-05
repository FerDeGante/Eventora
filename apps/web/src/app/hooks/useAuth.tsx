"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthUser = { email?: string; name?: string; role?: string };

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string, user?: AuthUser) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "eventora-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
        if (parsed.token) {
          setToken(parsed.token);
          setUser(parsed.user ?? null);
        }
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const setSession = (newToken: string, newUser?: AuthUser) => {
    setToken(newToken);
    setUser(newUser ?? null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: newToken, user: newUser ?? null }),
      );
    }
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, setSession, clearSession }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
