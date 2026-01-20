"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./hooks/useAuth";
import { TenantProvider } from "./contexts/TenantContext";
import { sendObsEvent } from "../lib/observability";

export type ThemeMode = "light" | "dark";

const ThemeContext = createContext<{ theme: ThemeMode; toggleTheme: () => void } | undefined>(undefined);

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("eventora-theme") as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export const useEventoraTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useEventoraTheme must be used within AppProviders");
  }
  return context;
};

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(getPreferredTheme());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem("eventora-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleError = (event: ErrorEvent) => {
      sendObsEvent({ scope: "global", type: "error", message: event.message, at: new Date().toISOString(), stack: event.error?.stack });
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      sendObsEvent({
        scope: "global",
        type: "unhandledrejection",
        message: String(event.reason),
        at: new Date().toISOString(),
      });
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <SessionProvider>
      <AuthProvider>
        <TenantProvider>
          <ThemeContext.Provider value={value}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </ThemeContext.Provider>
        </TenantProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
