import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { getTenantContext, setTenantContext } from "../lib/tenant-context";

const resolveTenantFromRequest = (
  request: FastifyRequest,
): { clinicId?: string; userId?: string; roles?: string[] } => {
  const clinicId = (request.headers["x-clinic-id"] as string | undefined)?.trim();
  const userId = (request.headers["x-user-id"] as string | undefined)?.trim();
  const roles = request.headers["x-user-roles"]
    ? String(request.headers["x-user-roles"])
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean)
    : undefined;
  return { clinicId, userId, roles };
};

const isTenantOptionalRoute = (path?: string) => {
  if (!path) return false;
  return (
    path === "/health" ||
    path.startsWith("/api/v1/public") ||
    path.startsWith("/api/v1/dashboard/overview") ||
    path.startsWith("/api/v1/notifications/templates") ||
    path.startsWith("/api/v1/pos/tickets") ||
    path.startsWith("/api/v1/pos/branches")
  );
};

export default fp(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const { clinicId, userId, roles } = resolveTenantFromRequest(request);
    const path = request.routerPath ?? request.url;
    const hasAuthHeader = Boolean(request.headers.authorization);

    // Some public routes (like create clinic) do not require tenancy
    const isPublicRoute =
      request.routerPath?.startsWith("/api/v1/clinics") && request.method === "POST";

    if (!clinicId && !isPublicRoute && !isTenantOptionalRoute(path) && !hasAuthHeader) {
      reply.code(400);
      throw new Error("Missing x-clinic-id header");
    }

    if (clinicId) {
      const current = getTenantContext();
      if (current?.clinicId && current.clinicId !== clinicId) {
        reply.code(400);
        throw new Error("Tenant context mismatch");
      }

      setTenantContext({
        clinicId,
        userId,
        roles,
        ip: request.ip,
        userAgent: request.headers["user-agent"] as string | undefined,
      });
    }

    if (!clinicId && hasAuthHeader) {
      request.log.debug("Clinic will be resolved from JWT in authenticate hook");
    }
  });
});
