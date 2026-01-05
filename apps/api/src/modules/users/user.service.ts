import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { hashPassword } from "../../utils/password";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./user.schema";
import { toPagination } from "../../utils/pagination";

export const listUsers = async (params: ListUsersQuery) => {
  const { clinicId } = assertTenant();
  const { skip, take } = toPagination({ page: params.page, pageSize: params.pageSize });
  return prisma.user.findMany({
    where: {
      clinicId,
      ...(params.role ? { role: params.role as any } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const createUser = async (input: CreateUserInput) => {
  const { clinicId } = assertTenant();

  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      clinicId,
      email: input.email,
      passwordHash,
      role: input.role ?? "CLIENT",
      name: input.name,
      phone: input.phone,
      staff:
        input.role && input.role !== "CLIENT"
          ? {
              create: {
                branchId: input.branchId,
              },
            }
          : undefined,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  return user;
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  const { clinicId } = assertTenant();

  const existing = await prisma.user.findFirst({ where: { id: userId, clinicId }, include: { staff: true } });
  if (!existing) throw new Error("User not found");

  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }

  let passwordHash: string | undefined;
  if (input.password) {
    passwordHash = await hashPassword(input.password);
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: {
      name: input.name ?? existing.name,
      phone: input.phone ?? existing.phone,
      role: input.role ?? existing.role,
      status: input.status ?? existing.status,
      ...(passwordHash ? { passwordHash } : {}),
      staff: existing.staff
        ? {
            update: {
              branchId: input.branchId ?? existing.staff.branchId ?? undefined,
            },
          }
        : input.role && input.role !== "CLIENT"
          ? {
              create: {
                branchId: input.branchId,
              },
            }
          : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return user;
};

export const deleteUser = async (userId: string) => {
  const { clinicId } = assertTenant();
  const existing = await prisma.user.findFirst({ where: { id: userId, clinicId } });
  if (!existing) throw new Error("User not found");
  await prisma.user.delete({ where: { id: userId } });
  return { id: userId, deleted: true };
};
