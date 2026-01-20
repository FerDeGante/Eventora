import type { FastifyInstance } from "fastify";
import { sendWhatsAppInput } from "./whatsapp.schema";
import { sendWhatsAppMessage } from "./whatsapp.service";

export async function whatsappRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = sendWhatsAppInput.parse(request.body);
      try {
        const result = await sendWhatsAppMessage(body);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );
}
