import { prisma } from "../lib/prisma";
import { getTenantContext, withTenantContext } from "../lib/tenant-context";

/**
 * Resolve a clinic id using, in order:
 * - explicit input
 * - the current async context
 * - the first clinic in the database (demo/default)
 */
export const resolveClinicId = async (clinicId?: string) => {
  if (clinicId) return clinicId;
  const ctx = getTenantContext();
  if (ctx?.clinicId) return ctx.clinicId;
  const clinic = await prisma.clinic.findFirst({ select: { id: true } });
  return clinic?.id;
};

/**
 * Ensures a tenant context exists while executing the callback.
 * If no clinic can be resolved, the callback still runs without enforcing a tenant-aware query,
 * allowing callers to return fallbacks gracefully.
 */
export const withResolvedTenant = async <T>(
  clinicId: string | undefined,
  callback: () => Promise<T>,
): Promise<T> => {
  const resolvedClinicId = await resolveClinicId(clinicId);
  if (!resolvedClinicId) return callback();

  if (getTenantContext()?.clinicId === resolvedClinicId) {
    return callback();
  }

  return withTenantContext({ clinicId: resolvedClinicId }, callback);
};
