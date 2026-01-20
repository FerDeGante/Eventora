import type { FastifyReply, FastifyRequest } from "fastify";
import { getTenantContext } from "../lib/tenant-context";

export type UserRole = "ADMIN" | "MANAGER" | "RECEPTION" | "THERAPIST" | "CLIENT";

/**
 * Minimal RBAC guard to enforce allowed roles on a route.
 * Uses JWT payload (request.user.role) or tenant context roles as fallback.
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const roleFromJwt = (request as any).user?.role as UserRole | undefined;
    const roleFromContext = getTenantContext()?.roles?.[0] as UserRole | undefined;
    const role = roleFromJwt ?? roleFromContext;

    if (!role || !allowedRoles.includes(role)) {
      reply.code(403);
      throw new Error("Forbidden: insufficient role");
    }
  };
};
