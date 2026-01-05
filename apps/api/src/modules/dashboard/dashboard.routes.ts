import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDashboardOverview, getDashboardStats } from "./dashboard.service";

const overviewQuery = z.object({
  clinicId: z.string().optional(),
});

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/overview", async (request, reply) => {
    const query = overviewQuery.parse(request.query ?? {});
    const clinicId = query.clinicId ?? (request.headers["x-clinic-id"] as string | undefined);

    try {
      const overview = await getDashboardOverview(clinicId);
      return overview;
    } catch (error: any) {
      request.log.error({ error }, "Failed to fetch dashboard overview");
      return reply.status(400).send({ message: error.message });
    }
  });

  // GET /stats - Métricas clave del dashboard
  app.get("/stats", { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const stats = await getDashboardStats();
      return stats;
    } catch (error: any) {
      request.log.error({ error }, "Failed to fetch dashboard stats");
      return reply.status(500).send({ message: error.message });
    }
  });
}
