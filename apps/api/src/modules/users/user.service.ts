import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { hashPassword } from "../../utils/password";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./user.schema";
import { toPagination } from "../../utils/pagination";

export const listUsers = async (params: ListUsersQuery) => {
  const { clinicId } = assertTenant();
  const { skip, take } = toPagination({ page: params.page, pageSize: params.pageSize });
  
  // Build membership filter
  let membershipFilter = {};
  if (params.hasMembership === "true") {
    membershipFilter = { memberships: { some: { status: "ACTIVE" } } };
  } else if (params.hasMembership === "false") {
    membershipFilter = { memberships: { none: { status: "ACTIVE" } } };
  }

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
      ...membershipFilter,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          membership: { select: { name: true } },
          status: true,
        },
        take: 1,
      },
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

export const exportUsersCSV = async (params: ListUsersQuery) => {
  const { clinicId } = assertTenant();
  
  // Build membership filter
  let membershipFilter = {};
  if (params.hasMembership === "true") {
    membershipFilter = { memberships: { some: { status: "ACTIVE" } } };
  } else if (params.hasMembership === "false") {
    membershipFilter = { memberships: { none: { status: "ACTIVE" } } };
  }

  const users = await prisma.user.findMany({
    where: {
      clinicId,
      role: "CLIENT",
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...membershipFilter,
    },
    select: {
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: { membership: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Generate CSV
  const headers = ["Nombre", "Email", "Teléfono", "Membresía", "Fecha Registro"];
  const rows = users.map(u => [
    u.name || "",
    u.email,
    u.phone || "",
    u.memberships[0]?.membership.name || "Sin membresía",
    new Date(u.createdAt).toLocaleDateString("es-MX"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csvContent;
};
