import type { FastifyInstance } from "fastify";
import { getGoogleOAuthClient } from "../../lib/google";
import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export async function googleIntegrationRoutes(app: FastifyInstance) {
  app.get("/auth-url", { preHandler: [app.authenticate] }, async (request, reply) => {
    if (!env.GOOGLE_CLIENT_ID) return reply.status(400).send({ message: "Google OAuth not configured" });
    const client = getGoogleOAuthClient();
    const url = client.generateAuthUrl({
      scope: ["https://www.googleapis.com/auth/calendar"],
      access_type: "offline",
      prompt: "consent",
    });
    return { url };
  });

  app.post("/callback", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { clinicId } = assertTenant();
    const { code } = request.body as { code: string };
    try {
      const client = getGoogleOAuthClient();
      const { tokens } = await client.getToken(code);
      await prisma.integrationCredential.upsert({
        where: { clinicId_provider: { clinicId, provider: "GOOGLE_CALENDAR" } },
        create: {
          clinicId,
          provider: "GOOGLE_CALENDAR",
          accessToken: tokens.access_token ?? undefined,
          refreshToken: tokens.refresh_token ?? undefined,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
        update: {
          accessToken: tokens.access_token ?? undefined,
          refreshToken: tokens.refresh_token ?? undefined,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
      });
      return reply.send({ connected: true });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });

  app.get("/status", { preHandler: [app.authenticate] }, async () => {
    const { clinicId } = assertTenant();
    const credential = await prisma.integrationCredential.findUnique({
      where: { clinicId_provider: { clinicId, provider: "GOOGLE_CALENDAR" } },
      select: { id: true, expiresAt: true, createdAt: true },
    });
    return { connected: !!credential, credential };
  });
}
