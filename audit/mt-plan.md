# Eventora Multi-Tenant Architecture Plan

## Objectives
- Support multi-clinic (tenant) isolation with shared Next.js + Node.js stack.
- Maintain compliance with LFPDPPP/GDPR-style principles and be HIPAA-friendly (minimum necessary, auditability, breach isolation).
- Enable upgrade path from single-tenant to shared schema (Plan A) and dedicated schema/database per enterprise customer (Plan B).

## Option A — Shared Schema with `clinic_id` + Postgres RLS
1. **Data model**
   - Add `Clinic` table (id, slug, name, billingStatus, createdAt, onboarding metadata).
   - Add `clinicId` (NOT NULL) foreign key to every PII-bearing model (User, Therapist, Branch, Package, Reservation, UserPackage, PasswordResetToken, AuditLog).
   - Create composite unique indexes (e.g., `@@index([clinicId, email])`, `@@unique([clinicId, stripePriceId])`).
   - Store `clinicId` in JWT/session and propagate via request context.
2. **Prisma tenant middleware**
   ```ts
   // src/lib/prisma-tenant.ts
   import { AsyncLocalStorage } from 'node:async_hooks';
   import { prisma } from './prisma';

   export const tenantContext = new AsyncLocalStorage<{ clinicId: string }>();

   export function runWithTenant<T>(clinicId: string, fn: () => Promise<T>) {
     return tenantContext.run({ clinicId }, fn);
   }

   prisma.$use(async (params, next) => {
     const ctx = tenantContext.getStore();
     if (!ctx) return next(params);

     const MODELS = ['User','Therapist','Branch','Package','Reservation','UserPackage','PasswordResetToken'];
     if (!params.model || !MODELS.includes(params.model)) {
       return next(params);
     }

     const injectWhere = () => {
       params.args ||= {};
       params.args.where = { clinicId: ctx.clinicId, ...(params.args.where || {}) };
     };

     switch (params.action) {
       case 'findMany':
       case 'findFirst':
       case 'aggregate':
       case 'count':
         injectWhere();
         break;
       case 'findUnique':
       case 'findUniqueOrThrow':
         params.args ||= {};
         params.args.where = {
           clinicId_id: { clinicId: ctx.clinicId, ...(params.args.where || {}) },
         };
         break;
       case 'create':
       case 'createMany':
       case 'update':
       case 'upsert':
         params.args ||= {};
         params.args.data = { clinicId: ctx.clinicId, ...(params.args.data || {}) };
         break;
       case 'delete':
       case 'deleteMany':
         injectWhere();
         break;
     }

     return next(params);
   });
   ```
3. **Request binding**
   - Next.js API middleware resolves tenant from subdomain/header and wraps handlers with `runWithTenant(clinicId, handler)`.
   - Inject `clinicId` into NextAuth JWT and `session.user.clinicId`.
4. **Row Level Security (RLS)**
   - Postgres role `app_user` uses RLS to enforce `clinic_id = current_setting('app.current_tenant')::uuid`.
   ```sql
   ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
   CREATE POLICY user_isolation ON "User"
     USING (clinic_id = current_setting('app.current_tenant')::uuid)
     WITH CHECK (clinic_id = current_setting('app.current_tenant')::uuid);

   ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
   CREATE POLICY reservation_isolation ON "Reservation"
     USING (clinic_id = current_setting('app.current_tenant')::uuid)
     WITH CHECK (clinic_id = current_setting('app.current_tenant')::uuid);
   ```
   - Each request sets `SET app.current_tenant = '<clinic-uuid>';` via Prisma `$executeRaw` in middleware.
5. **Stripe metadata**
   - Include `clinicId` and `tenantSlug` in `CheckoutSession.metadata` and verify inside webhook before persisting data.
6. **Backups & Observability**
   - Tag metrics, traces, and audit logs with `clinicId` to support per-tenant dashboards.
   - Partition backup retention policies per clinic for selective restores.

## Option B — Dedicated Schema / Database per Enterprise Tenant
1. **Provisioning**
   - Each enterprise clinic gets its own schema (`clinic_{slug}`) or dedicated Postgres database (Neon branch).
   - Migration runner accepts `--schema=clinic_slug` and executes the same Prisma migrations.
2. **Routing**
   - Tenant router selects DATABASE_URL at runtime (via connection pool map) using AsyncLocalStorage or a request-scoped Prisma client.
   - Background jobs (queues, CRON) iterate over tenant registry to process tasks per schema.
3. **Isolation Benefits**
   - Strong blast-radius reduction, easier HIPAA BAA alignment.
   - Allows per-tenant maintenance windows and data residency requirements.
4. **Trade-offs**
   - More operational overhead (connection pools, migrations fan-out).
   - Stripe product catalog must be duplicated or parameterized per tenant.

## Tenant Extraction Strategy
- Maintain canonical `Clinic` registry with metadata (`mode: shared|enterprise`, `databaseUrl`, `schema`).
- Start all tenants in shared mode (Plan A). When an enterprise upgrade is approved:
  1. Freeze writes for that clinic via feature flag.
  2. Export tenant data using `COPY` or Prisma to JSON.
  3. Provision isolated Neon branch / schema and run migrations.
  4. Import tenant data, update `Clinic` record to `mode=enterprise` with new connection info.
  5. Flip routing to dedicated pool, run smoke tests, then re-enable writes.
- Maintain migration playbook (see `migration_playbook.md`) with rollback instructions.

## Mermaid Diagram
```mermaid
digraph TENANCY {
  rankdir=LR;
  subgraph cluster_shared {
    label="Plan A - Shared Schema";
    appA["Next.js API\n(runWithTenant)"];
    prismaA["Prisma Client\n(tenant middleware)"];
    dbA["Postgres\npublic schema\nRLS enabled"];
    appA -> prismaA -> dbA;
  }
  subgraph cluster_dedicated {
    label="Plan B - Dedicated Schema/DB";
    appB["Next.js API\n(tenant router)"];
    prismaB["Prisma Client Pool"];
    dbB1["Postgres schema clinic_alpha"];
    dbB2["Postgres schema clinic_beta"];
    appB -> prismaB;
    prismaB -> dbB1;
    prismaB -> dbB2;
  }
  registry["Clinic Registry\n(mode, dbUrl)"];
  appA -> registry;
  appB -> registry;
  registry -> appA;
  registry -> appB;
}
```

## Additional Safeguards
- Enforce composite indexes (`@@index([clinicId, date])`, `@@unique([clinicId, email])`) to keep tenant-scoped queries performant.
- Add Prisma tests asserting tenant scoping (example test provided in `migration_playbook.md`).
- Leverage Neon roles to limit each connection string to a single schema/tenant when feasible.
