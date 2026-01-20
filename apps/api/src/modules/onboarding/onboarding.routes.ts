import { FastifyPluginAsync } from 'fastify';
import * as onboardingService from './onboarding.service';
import { signupSchema, checkSlugSchema } from './onboarding.schema';

const onboardingRoutes: FastifyPluginAsync = async (fastify) => {
  // ============================================
  // PUBLIC ROUTES (No auth required)
  // ============================================

  // Get available plans
  fastify.get('/plans', async (request, reply) => {
    const plans = await onboardingService.getPlans();
    return reply.send({ plans });
  });

  // Check if slug is available
  fastify.post('/check-slug', async (request, reply) => {
    const { slug } = checkSlugSchema.parse(request.body);
    const available = await onboardingService.isSlugAvailable(slug);
    return reply.send({ slug, available });
  });

  // Generate slug from name
  fastify.post('/generate-slug', async (request, reply) => {
    const { name } = request.body as { name: string };
    if (!name) {
      return reply.status(400).send({ error: 'Name is required' });
    }
    const slug = onboardingService.generateSlug(name);
    const available = await onboardingService.isSlugAvailable(slug);
    return reply.send({ slug, available });
  });

  // Signup - Create workspace and redirect to checkout
  fastify.post('/signup', async (request, reply) => {
    const input = signupSchema.parse(request.body);
    try {
      const result = await onboardingService.createWorkspaceWithCheckout(input);
      return reply.status(201).send(result);
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        return reply.status(409).send({ error: error.message });
      }
      return reply.status(400).send({ error: error.message });
    }
  });

  // Verify Stripe checkout session and create JWT
  fastify.post('/verify-session', async (request, reply) => {
    const { sessionId } = request.body as { sessionId: string };
    if (!sessionId) {
      return reply.status(400).send({ success: false, error: 'Session ID is required' });
    }
    try {
      const result = await onboardingService.verifyCheckoutSession(sessionId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message });
    }
  });
};

export default onboardingRoutes;
