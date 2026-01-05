import type { FastifyInstance } from "fastify";
import { createClinicInput } from "./clinic.schema";
import { createClinic, getClinicBySlug, listClinics } from "./clinic.service";

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

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const clinic = await getClinicBySlug(slug);
    if (!clinic) {
      return reply.code(404).send({ message: "Clinic not found" });
    }
    return clinic;
  });
}
