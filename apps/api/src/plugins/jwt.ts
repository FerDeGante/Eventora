import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../lib/env";
import { getTenantContext, setTenantContext } from "../lib/tenant-context";

type AuthPayload = {
  sub: string;
  clinicId: string;
  role?: string;
};

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: "1h",
    },
  });

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await request.jwtVerify<AuthPayload>();
      if (!payload?.clinicId) {
        reply.code(401);
        throw new Error("Invalid token payload");
      }

      const headerClinicId = (request.headers["x-clinic-id"] as string | undefined)?.trim();
      if (headerClinicId && headerClinicId !== payload.clinicId) {
        reply.code(403);
        throw new Error("Clinic mismatch between token and header");
      }

      const ctx = getTenantContext();
      const nextRoles = payload.role ? [payload.role] : ctx?.roles;

      if (!ctx || ctx.clinicId !== payload.clinicId || !ctx.userId) {
        setTenantContext({
          clinicId: payload.clinicId,
          userId: payload.sub,
          roles: nextRoles,
          ip: request.ip,
          userAgent: request.headers["user-agent"] as string | undefined,
        });
      }
    } catch (err) {
      return reply.send(err);
    }
  });
});
