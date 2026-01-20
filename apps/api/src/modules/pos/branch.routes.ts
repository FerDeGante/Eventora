import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withResolvedTenant } from "../../utils/tenant-resolver";
import { closeBranchShift } from "./ticket.service";

const branchParams = z.object({ branchId: z.string().min(1) });

export async function posBranchRoutes(app: FastifyInstance) {
  app.post("/:branchId/close-shift", async (request, reply) => {
    const { branchId } = branchParams.parse(request.params ?? {});
    try {
      const clinicId = request.headers["x-clinic-id"] as string | undefined;
      const result = await withResolvedTenant(clinicId, () => closeBranchShift(branchId));
      return result;
    } catch (error: any) {
      request.log.error({ error }, "Failed to close cash shift for branch");
      return reply.status(400).send({ message: error.message });
    }
  });
}
