import type { FastifyInstance } from "fastify";
import { publicSearchQuery, publicAvailabilityQuery, publicBranchQuery, publicServiceQuery } from "./public.schema";
import { listPublicClinics, listPublicBranches, listPublicServices, publicAvailability } from "./public.service";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/clinics", async (request) => {
    const query = publicSearchQuery.parse(request.query ?? {});
    return listPublicClinics(query);
  });

  app.get("/branches", async (request) => {
    const query = publicBranchQuery.parse(request.query ?? {});
    return listPublicBranches(query.clinicSlug);
  });

  app.get("/services", async (request) => {
    const query = publicServiceQuery.parse(request.query ?? {});
    return listPublicServices(query.clinicSlug);
  });

  app.get("/availability", async (request, reply) => {
    const query = publicAvailabilityQuery.parse(request.query ?? {});
    try {
      const slots = await publicAvailability({ ...query, branchId: query.branchId ?? "" });
      return slots;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });
}
