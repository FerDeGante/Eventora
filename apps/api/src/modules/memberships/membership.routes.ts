import { FastifyPluginAsync } from 'fastify';
import * as membershipService from './membership.service';
import {
  createMembershipSchema,
  updateMembershipSchema,
  membershipQuerySchema,
  createUserMembershipSchema,
  updateUserMembershipSchema,
  userMembershipQuerySchema,
  checkInSchema,
} from './membership.schema';
import { z } from 'zod';

const membershipRoutes: FastifyPluginAsync = async (fastify) => {
  // ============================================
  // MEMBERSHIP PLANS (CRUD)
  // ============================================

  // List memberships
  fastify.get('/', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const query = membershipQuerySchema.parse(request.query);
    const result = await membershipService.listMemberships(clinicId, query);
    return reply.send(result);
  });

  // Get membership by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const membership = await membershipService.getMembershipById(clinicId, request.params.id);
    if (!membership) {
      return reply.status(404).send({ error: 'Membership not found' });
    }
    return reply.send(membership);
  });

  // Create membership
  fastify.post('/', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = createMembershipSchema.parse(request.body);
    const membership = await membershipService.createMembership(clinicId, input);
    return reply.status(201).send(membership);
  });

  // Update membership
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = updateMembershipSchema.parse(request.body);
    const membership = await membershipService.updateMembership(clinicId, request.params.id, input);
    if (!membership) {
      return reply.status(404).send({ error: 'Membership not found' });
    }
    return reply.send(membership);
  });

  // Delete membership
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const membership = await membershipService.deleteMembership(clinicId, request.params.id);
      if (!membership) {
        return reply.status(404).send({ error: 'Membership not found' });
      }
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // ============================================
  // USER MEMBERSHIPS (Subscriptions)
  // ============================================

  // List user memberships
  fastify.get('/subscriptions', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const query = userMembershipQuerySchema.parse(request.query);
    const result = await membershipService.listUserMemberships(clinicId, query);
    return reply.send(result);
  });

  // Get user membership by ID
  fastify.get<{ Params: { id: string } }>('/subscriptions/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const userMembership = await membershipService.getUserMembershipById(clinicId, request.params.id);
    if (!userMembership) {
      return reply.status(404).send({ error: 'Subscription not found' });
    }
    return reply.send(userMembership);
  });

  // Create user membership (subscribe user to a plan)
  fastify.post('/subscriptions', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = createUserMembershipSchema.parse(request.body);
    try {
      const userMembership = await membershipService.createUserMembership(clinicId, input);
      return reply.status(201).send(userMembership);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Update user membership
  fastify.patch<{ Params: { id: string } }>('/subscriptions/:id', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = updateUserMembershipSchema.parse(request.body);
    const userMembership = await membershipService.updateUserMembership(
      clinicId, 
      request.params.id, 
      input
    );
    if (!userMembership) {
      return reply.status(404).send({ error: 'Subscription not found' });
    }
    return reply.send(userMembership);
  });

  // Cancel user membership
  fastify.post<{ Params: { id: string } }>('/subscriptions/:id/cancel', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const { immediate } = z.object({ immediate: z.boolean().default(false) }).parse(request.body);
    try {
      const userMembership = await membershipService.cancelUserMembership(
        clinicId, 
        request.params.id, 
        immediate
      );
      if (!userMembership) {
        return reply.status(404).send({ error: 'Subscription not found' });
      }
      return reply.send(userMembership);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // ============================================
  // CHECK-IN / CHECK-OUT
  // ============================================

  // Check-in
  fastify.post('/check-in', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const input = checkInSchema.parse(request.body);
    try {
      const checkIn = await membershipService.checkIn(clinicId, input);
      return reply.status(201).send(checkIn);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Check-out
  fastify.post<{ Params: { id: string } }>('/check-in/:id/checkout', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    try {
      const checkIn = await membershipService.checkOut(clinicId, request.params.id);
      return reply.send(checkIn);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get check-in history for a subscription
  fastify.get<{ Params: { id: string } }>('/subscriptions/:id/check-ins', async (request, reply) => {
    const clinicId = (request as any).clinicId;
    const { limit, offset } = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    }).parse(request.query);
    
    const result = await membershipService.getCheckInHistory(
      clinicId, 
      request.params.id, 
      limit, 
      offset
    );
    return reply.send(result);
  });
};

export default membershipRoutes;
