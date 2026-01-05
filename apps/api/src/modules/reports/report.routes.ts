import type { FastifyInstance } from "fastify";
import { getFinancialOverview, getOccupancyStats } from "./report.service";

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
}
