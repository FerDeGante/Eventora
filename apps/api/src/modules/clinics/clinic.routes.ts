import type { FastifyInstance } from "fastify";
import { createClinicInput, updateClinicInput } from "./clinic.schema";
import { createClinic, getClinicBySlug, listClinics, getClinicById, updateClinic, listBranches } from "./clinic.service";
import { assertTenant } from "../../utils/tenant";

export async function clinicRoutes(app: FastifyInstance) {
  app.post(
    "/",
    async (request, reply) => {
      const body = createClinicInput.parse(request.body);
      const clinic = await createClinic(body);
      return reply.code(201).send(clinic);
    },
  );

  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return listClinics();
  });

  // Get current clinic (for settings page)
  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { clinicId } = assertTenant();
    const clinic = await getClinicById(clinicId);
    if (!clinic) {
      return reply.code(404).send({ message: "Clinic not found" });
    }
    return clinic;
  });

  // List branches for current clinic
  app.get("/me/branches", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { clinicId } = assertTenant();
    const branches = await listBranches(clinicId);
    return branches;
  });

  // Update current clinic settings
  app.patch("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { clinicId } = assertTenant();
    const body = updateClinicInput.parse(request.body);
    try {
      const clinic = await updateClinic(clinicId, body);
      return reply.send(clinic);
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const clinic = await getClinicBySlug(slug);
    if (!clinic) {
      return reply.code(404).send({ message: "Clinic not found" });
    }
    return clinic;
  });
}
