import type { FastifyInstance } from "fastify";
import { getFinancialOverview, getOccupancyStats, getTopServices, getDashboardSummary } from "./report.service";

export async function reportRoutes(app: FastifyInstance) {
  app.get(
    "/financial",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { start, end } = request.query as { start?: string; end?: string };
      return getFinancialOverview(start, end);
    },
  );

  app.get(
    "/occupancy",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { start, end } = request.query as { start?: string; end?: string };
      return getOccupancyStats(start, end);
    },
  );

  app.get(
    "/top-services",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { start, end, limit } = request.query as { start?: string; end?: string; limit?: string };
      return getTopServices(start, end, limit ? parseInt(limit) : 10);
    },
  );

  app.get(
    "/summary",
    { preHandler: [app.authenticate] },
    async (request) => {
      const { start, end } = request.query as { start?: string; end?: string };
      return getDashboardSummary(start, end);
    },
  );
}
