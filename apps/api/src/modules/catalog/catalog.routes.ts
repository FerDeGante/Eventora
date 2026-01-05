import type { FastifyInstance } from "fastify";
import { 
  listPackages, 
  listServices, 
  createPackage, 
  updatePackage, 
  deletePackage, 
  getPackageById,
  createService,
  updateService,
  deleteService,
} from "./catalog.service";
import { packageCreateInput, packageUpdateInput } from "./package.schema";
import { serviceCreateInput, serviceUpdateInput } from "./service.schema";

export async function catalogRoutes(app: FastifyInstance) {
  // ============ SERVICES ============
  app.get("/services", async () => {
    return listServices();
  });

  app.post(
    "/services",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const body = serviceCreateInput.parse(request.body);
      try {
        const service = await createService(body);
        return reply.code(201).send(service);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/services/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = serviceUpdateInput.parse(request.body ?? {});
      try {
        const service = await updateService(id, body);
        return reply.send(service);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.delete(
    "/services/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const result = await deleteService(id);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  // ============ PACKAGES ============
  app.get("/packages", async () => {
    return listPackages();
  });

  app.get("/packages/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const pkg = await getPackageById(id);
    if (!pkg) return reply.status(404).send({ message: "Package not found" });
    return pkg;
  });

  app.post(
    "/packages",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const body = packageCreateInput.parse(request.body);
      try {
        const pkg = await createPackage(body);
        return reply.code(201).send(pkg);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/packages/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = packageUpdateInput.parse(request.body ?? {});
      try {
        const pkg = await updatePackage(id, body);
        return reply.send(pkg);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.delete(
    "/packages/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deletePackage(id);
      return reply.status(204).send();
    },
  );
}
