import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";

export const userRoleEnum = z.enum(["ADMIN", "MANAGER", "RECEPTION", "THERAPIST", "CLIENT"]);

export const createUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleEnum.optional().default("CLIENT"),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  branchId: z.string().optional(),
});

export const updateUserInput = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: userRoleEnum.optional(),
  status: z.string().optional(),
  branchId: z.string().optional(),
  password: z.string().min(8).optional(),
});

export const listUsersQuery = paginationQuery.extend({
  role: userRoleEnum.optional(),
  search: z.string().optional(),
  hasMembership: z.enum(["true", "false"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserInput>;
export type UpdateUserInput = z.infer<typeof updateUserInput>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
