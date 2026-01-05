import "fastify";
import "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    rawBody: Buffer;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; clinicId: string; role: string };
    user: { sub: string; clinicId: string; role: string };
  }
}
