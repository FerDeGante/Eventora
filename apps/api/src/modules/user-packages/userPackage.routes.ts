import type { FastifyInstance } from "fastify";
import { createUserPackageInput, transferSessionsInput, consumeSessionInput } from "./userPackage.schema";
import { 
  listUserPackages, 
  assignUserPackage, 
  transferSessions,
  getUserPackageById,
  listAllUserPackages,
  consumeSession,
} from "./userPackage.service";

export async function userPackageRoutes(app: FastifyInstance) {
  // Listar todos los paquetes de usuario (admin)
  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return listAllUserPackages();
  });

  // Listar paquetes de un usuario específico
  app.get("/:userId", { preHandler: [app.authenticate] }, async (request) => {
    const { userId } = request.params as { userId: string };
    return listUserPackages(userId);
  });

  app.post(
    "/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = createUserPackageInput.parse(request.body);
      try {
        const result = await assignUserPackage(body);
        return reply.code(201).send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/transfer",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = transferSessionsInput.parse(request.body);
      try {
        const result = await transferSessions(body.fromUserPackageId, body.toUserId, body.sessions);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  // Obtener un paquete de usuario específico
  app.get("/package/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const userPackage = await getUserPackageById(id);
      return reply.send(userPackage);
    } catch (error: any) {
      return reply.status(404).send({ message: error.message });
    }
  });

  // Consumir sesión de un paquete
  app.patch(
    "/package/:id/consume",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = consumeSessionInput.parse(request.body ?? {});
      try {
        const result = await consumeSession(id, body.sessions);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );
}
