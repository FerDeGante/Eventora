import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  clinicId: z.string().nullable(),
});

export const authSchemas = {
  loginBody: loginBodySchema,
  userResponse: userResponseSchema,
};

// Example route with Swagger schema
export const exampleAuthRoute = (app: FastifyInstance) => {
  app.post('/login', {
    schema: {
      tags: ['auth'],
      summary: 'User login',
      description: 'Authenticate a user with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@bloom.com' },
          password: { type: 'string', minLength: 6, example: 'password123' },
        },
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT access token' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        401: {
          description: 'Invalid credentials',
          $ref: '#/components/schemas/Error',
        },
      },
    },
    handler: async (request, reply) => {
      // Implementation
      return { token: 'jwt-token', user: {} };
    },
  });
};
