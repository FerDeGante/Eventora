import { Prisma, PrismaClient } from "@prisma/client";
import { getTenantContext, setTenantContext } from "./tenant-context";
import { writeAuditLog } from "./audit";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const TENANT_MODELS = new Set<string>([
  "Branch",
  "User",
  "ServiceCategory",
  "Service",
  "Package",
  "Resource",
  "AvailabilityTemplate",
  "AvailabilityException",
  "UserPackage",
  "Reservation",
  "PaymentIntent",
  "PosTerminal",
  "PosPrinter",
  "PosPrintJob",
  "IntegrationCredential",
  "CashShift",
  "Notification",
  "NotificationTemplate",
  "AuditLog",
  "PasswordResetToken",
]);

const AUDIT_EXCLUDED_MODELS = new Set<string>(["PasswordResetToken", "AuditLog"]);
const WRITE_ACTIONS = new Set<Prisma.PrismaAction>([
  "create",
  "createMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
]);
const SCOPE_ACTIONS = new Set<Prisma.PrismaAction>([
  "findMany",
  "findFirst",
  "aggregate",
  "count",
  "updateMany",
  "deleteMany",
  "groupBy",
]);
const AUDITABLE_ACTIONS = new Set<Prisma.PrismaAction>([
  "create",
  "createMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
]);

const extractClinicId = (args: Record<string, any> | undefined): string | undefined => {
  if (!args) return undefined;
  if (typeof args.data?.clinicId === "string") return args.data.clinicId;
  if (Array.isArray(args.data) && typeof args.data[0]?.clinicId === "string") return args.data[0].clinicId;
  if (typeof args.where?.clinicId === "string") return args.where.clinicId;
  if (typeof args.create?.clinicId === "string") return args.create.clinicId;
  return undefined;
};

const scopeWhereWithClinic = (operation: Prisma.PrismaAction, args: Record<string, any>, clinicId: string) => {
  if (!SCOPE_ACTIONS.has(operation)) return;
  args.where = { ...(args.where ?? {}), clinicId };
};

const scopeDataWithClinic = (operation: Prisma.PrismaAction, args: Record<string, any>, clinicId: string) => {
  if (operation === "create") {
    args.data = { ...(args.data ?? {}), clinicId };
  } else if (operation === "upsert") {
    args.create = { ...(args.create ?? {}), clinicId };
    args.update = { ...(args.update ?? {}), clinicId: args.update?.clinicId ?? clinicId };
    if (args.update?.clinicId && args.update.clinicId !== clinicId) {
      throw new Error("Cannot change clinicId for existing record");
    }
  } else if (operation === "createMany") {
    if (Array.isArray(args.data)) {
      args.data = args.data.map((item: any) => ({ ...item, clinicId: item.clinicId ?? clinicId }));
    } else if (args.data) {
      args.data = { ...args.data, clinicId: args.data.clinicId ?? clinicId };
    }
  }

  if (operation === "update" && args.data?.clinicId && args.data.clinicId !== clinicId) {
    throw new Error("Cannot change clinicId for existing record");
  }

  if (operation === "updateMany" && args.data?.clinicId && args.data.clinicId !== clinicId) {
    throw new Error("Cannot change clinicId for existing record");
  }
};

const resolveEntityId = (result: any, args: Record<string, any>, operation: Prisma.PrismaAction): string | undefined => {
  if (result?.id) return String(result.id);
  if (typeof args?.where?.id === "string") return args.where.id;
  if (["createMany", "updateMany", "deleteMany"].includes(operation)) return "bulk";
  return undefined;
};

const resolveAuditData = (operation: Prisma.PrismaAction, args: Record<string, any>) => {
  if (operation === "upsert") {
    return { create: args.create, update: args.update };
  }
  return args.data;
};

const createClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  const extended = client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelName = model as string;
          const isTenantModel = TENANT_MODELS.has(modelName);
          const isWriteAction = WRITE_ACTIONS.has(operation);

          if (modelName === "AuditLog") {
            return query(args);
          }

          let tenant = getTenantContext();

          if (!tenant && isTenantModel && isWriteAction) {
            const derivedClinicId = extractClinicId(args as Record<string, any>);
            if (derivedClinicId) {
              try {
                setTenantContext({ clinicId: derivedClinicId });
                tenant = getTenantContext();
              } catch {
                // ignore invalid context derivation
              }
            }
          }

          if (isTenantModel && isWriteAction && !tenant?.clinicId) {
            throw new Error("Tenant context is required for write operations");
          }

          if (isTenantModel && tenant?.clinicId) {
            scopeWhereWithClinic(operation, args as Record<string, any>, tenant.clinicId);
            scopeDataWithClinic(operation, args as Record<string, any>, tenant.clinicId);
          }

          const result = await query(args);

          if (tenant?.clinicId && isTenantModel && AUDITABLE_ACTIONS.has(operation) && !AUDIT_EXCLUDED_MODELS.has(modelName)) {
            const entityId = resolveEntityId(result, args as Record<string, any>, operation);
            const auditData = resolveAuditData(operation, args as Record<string, any>);
            await writeAuditLog(client, {
              action: operation,
              entity: modelName,
              entityId,
              data: auditData,
            });
          }

          return result;
        },
      },
    },
  });

  return extended as unknown as PrismaClient;
};

export const prisma: PrismaClient = globalThis.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
