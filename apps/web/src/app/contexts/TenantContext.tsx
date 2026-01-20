"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

type TenantContextValue = {
  clinicId: string | null;
  hasTenant: boolean;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const value = useMemo<TenantContextValue>(
    () => ({
      clinicId: user?.clinicId ?? null,
      hasTenant: Boolean(user?.clinicId),
    }),
    [user?.clinicId]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
};
