import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContext = {
  clinicId: string;
  userId?: string;
  roles?: string[];
  ip?: string;
  userAgent?: string;
};

const storage = new AsyncLocalStorage<TenantContext>();

export const withTenantContext = async <T>(
  context: TenantContext,
  callback: () => Promise<T> | T,
): Promise<T> => {
  return storage.run(context, callback);
};

export const setTenantContext = (context: Partial<TenantContext>): void => {
  const current = storage.getStore();
  const next = { ...current, ...context };
  if (!next.clinicId) {
    throw new Error("Tenant context requires clinicId");
  }
  storage.enterWith(next as TenantContext);
};

export const getTenantContext = (): TenantContext | undefined => {
  return storage.getStore();
};
