import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import {
  registerInput,
  loginInput,
  passwordResetRequestInput,
  passwordResetInput,
  twoFactorVerifyInput,
  toggleTwoFactorInput,
} from "./auth.schema";
import {
  registerUser,
  authenticateUser,
  sendPasswordResetCode,
  resetPassword,
  sendTwoFactorCode,
  verifyTwoFactorCode,
  toggleTwoFactor,
} from "./auth.service";
import { enforceRateLimit, RateLimitError } from "../../lib/rate-limit";

const rateLimitGuard =
  (keyPrefix: string, limit: number, windowSeconds: number) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const email =
      typeof (request.body as any)?.email === "string"
        ? String((request.body as any).email).toLowerCase()
        : undefined;
    const identifier = email ? `${request.ip}:${email}` : request.ip;
    try {
      await enforceRateLimit(request, { keyPrefix, limit, windowSeconds, identifier });
    } catch (error) {
      if (error instanceof RateLimitError) {
        return reply
          .header("Retry-After", error.retryAfterSeconds)
          .status(429)
          .send({ message: "Too many requests. Please try again later." });
      }
      throw error;
    }
  };

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", { preHandler: [rateLimitGuard("auth:register", 5, 300)] }, async (request, reply) => {
    const body = registerInput.parse(request.body);
    try {
      const user = await registerUser(body);
      const token = app.jwt.sign({ sub: user.id, clinicId: user.clinicId, role: user.role });
      return reply.code(201).send({ accessToken: token, user });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });

  app.post("/login", { preHandler: [rateLimitGuard("auth:login", 8, 60)] }, async (request, reply) => {
    const body = loginInput.parse(request.body);
    try {
      const user = await authenticateUser(body.email, body.password);
      if (user.twoFactorEnabled) {
        await sendTwoFactorCode(user);
        return reply.send({ twoFactorRequired: true });
      }
      const token = app.jwt.sign({ sub: user.id, clinicId: user.clinicId, role: user.role });
      return reply.send({ accessToken: token });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });

  app.post(
    "/two-factor/verify",
    { preHandler: [rateLimitGuard("auth:2fa", 6, 300)] },
    async (request, reply) => {
      const body = twoFactorVerifyInput.parse(request.body);
      try {
        const user = await verifyTwoFactorCode(body.email, body.token);
        const token = app.jwt.sign({ sub: user.id, clinicId: user.clinicId, role: user.role });
        return reply.send({ accessToken: token });
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/password/request",
    { preHandler: [rateLimitGuard("auth:password-request", 3, 600)] },
    async (request, reply) => {
      const body = passwordResetRequestInput.parse(request.body);
      await sendPasswordResetCode(body.email);
      return reply.send({ ok: true });
    },
  );

  app.post(
    "/password/reset",
    { preHandler: [rateLimitGuard("auth:password-reset", 5, 600)] },
    async (request, reply) => {
      const body = passwordResetInput.parse(request.body);
      try {
        await resetPassword(body.email, body.token, body.newPassword);
        return reply.send({ ok: true });
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/two-factor/toggle",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const body = toggleTwoFactorInput.parse(request.body);
      const userId = request.user.sub as string;
      try {
        const result = await toggleTwoFactor(userId, body.enabled);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  // GET /me - Obtener perfil del usuario autenticado
  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user.sub as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        clinicId: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }
    return user;
  });

  // POST /logout - Invalidar token (lado cliente principalmente)
  app.post("/logout", { preHandler: [app.authenticate] }, async (request, reply) => {
    // En JWT stateless, el logout es principalmente del lado del cliente
    // Aquí podríamos registrar el evento o invalidar tokens en una blacklist
    return reply.send({ ok: true, message: "Logged out successfully" });
  });

  // POST /refresh - Refrescar token de acceso
  app.post("/refresh", async (request, reply) => {
    try {
      // Verificar el token actual
      await request.jwtVerify();
      const userId = request.user.sub as string;
      const clinicId = request.user.clinicId as string;
      const role = request.user.role as string;

      // Generar nuevo token
      const newToken = app.jwt.sign({ sub: userId, clinicId, role });
      return reply.send({ accessToken: newToken });
    } catch (error) {
      return reply.status(401).send({ message: "Invalid or expired token" });
    }
  });
}
