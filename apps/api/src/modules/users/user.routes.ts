import type { FastifyInstance } from "fastify";
import { createUserInput, listUsersQuery, updateUserInput } from "./user.schema";
import { createUser, deleteUser, listUsers, updateUser } from "./user.service";

export async function userRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    const query = listUsersQuery.parse(request.query ?? {});
    return listUsers(query);
  });

  app.post(
    "/",
    async (request, reply) => {
      const body = createUserInput.parse(request.body);
      try {
        const user = await createUser(body);
        return reply.code(201).send(user);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateUserInput.parse(request.body ?? {});
      try {
        const user = await updateUser(id, body);
        return reply.send(user);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.delete("/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await deleteUser(id);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });
}
