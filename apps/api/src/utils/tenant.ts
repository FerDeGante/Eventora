import { getTenantContext } from "../lib/tenant-context";

export const assertTenant = () => {
  const context = getTenantContext();
  if (!context?.clinicId) {
    throw new Error("Tenant context not available");
  }
  return context;
};
