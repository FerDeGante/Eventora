"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/lib/rbac";

type AuthUser = { 
  id?: string;
  email?: string; 
  name?: string; 
  role?: Role; 
  clinicId?: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string, user?: AuthUser) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "eventora-auth";
const COOKIE_NAME = "eventora-auth-token";
const COOKIE_MAX_AGE = 60 * 60; // 1 hour (matches JWT expiry)

// Cookie helpers
const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const deriveUserFromToken = (token: string, baseUser?: AuthUser | null) => {
  const payload = decodeJwtPayload(token);
  const id = payload?.sub as string | undefined;
  const role = payload?.role as Role | undefined;
  const clinicId = payload?.clinicId as string | undefined;
  return {
    ...(baseUser ?? {}),
    id: baseUser?.id ?? id,
    role: baseUser?.role ?? role,
    clinicId: baseUser?.clinicId ?? clinicId,
  };
};

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
          const derivedUser = deriveUserFromToken(parsed.token, parsed.user ?? null);
          setToken(parsed.token);
          setUser(derivedUser);
          // Sync token to cookie for middleware access
          setCookie(COOKIE_NAME, parsed.token, COOKIE_MAX_AGE);
        }
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const setSession = (newToken: string, newUser?: AuthUser) => {
    const derivedUser = deriveUserFromToken(newToken, newUser ?? null);
    setToken(newToken);
    setUser(derivedUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: newToken, user: derivedUser }),
      );
      // Also set cookie for middleware
      setCookie(COOKIE_NAME, newToken, COOKIE_MAX_AGE);
    }
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      deleteCookie(COOKIE_NAME);
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
