import { FastifyPluginAsync } from 'fastify';
import * as connectService from './connect.service';
import { createConnectAccountSchema } from './connect.schema';
import { z } from 'zod';

const connectRoutes: FastifyPluginAsync = async (fastify) => {
  // ============================================
  // STRIPE CONNECT ONBOARDING
  // ============================================

  // Get Connect account status
  fastify.get('/status', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const status = await connectService.getConnectAccountStatus(clinicId);
      return reply.send(status);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Start Connect onboarding
  fastify.post('/onboarding', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = createConnectAccountSchema.parse(request.body);
    try {
      const result = await connectService.createConnectAccount(
        clinicId,
        input.refreshUrl,
        input.returnUrl
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get Stripe Express dashboard login link
  fastify.post('/dashboard-link', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const result = await connectService.createLoginLink(clinicId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // ============================================
  // PAYMENTS (with Connect)
  // ============================================

  // Create PaymentIntent
  fastify.post('/payment-intent', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = z.object({
      amount: z.number().int().min(100), // mínimo 1 MXN
      currency: z.string().default('mxn'),
      metadata: z.record(z.string()).optional(),
    }).parse(request.body);

    try {
      const result = await connectService.createPaymentIntent(
        clinicId,
        input.amount,
        input.currency,
        input.metadata
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Create Checkout Session
  fastify.post('/checkout', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = z.object({
      lineItems: z.array(z.object({
        name: z.string(),
        amount: z.number().int().min(100),
        quantity: z.number().int().min(1).default(1),
      })),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
      customerEmail: z.string().email().optional(),
      metadata: z.record(z.string()).optional(),
    }).parse(request.body);

    try {
      const result = await connectService.createCheckoutSession(
        clinicId,
        input.lineItems,
        input.successUrl,
        input.cancelUrl,
        input.customerEmail,
        input.metadata
      );
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });
};

export default connectRoutes;
