# Bloom SaaS Readiness Audit

Prepared by: Technical SaaS Auditor (Health vertical)
Date: 2025-10-03

## Executive Summary
Bloom currently operates as a single-clinic platform with monolithic data assumptions. Core models lack tenant identifiers and several API endpoints expose data without authentication, leading to critical risks once multiple clinics share the same infrastructure. Security hygiene is below healthcare SaaS expectations (hard-coded secrets, no rate limiting, minimal logging), and billing automation with Stripe is incomplete (no idempotency, inconsistent metadata). A structured multi-sprint remediation plan is required before onboarding additional clinics.

### SaaS Readiness Scorecard
| Dimension | Score (0-10) | Notes |
|-----------|--------------|-------|
| Tenancy | 1 | No `clinicId` columns, no tenant scoping, no RLS. 【F:prisma/schema.prisma†L12-L99】【F:src/pages/api/packages.ts†L18-L27】 |
| Security | 2 | Critical access control gaps and leaked secrets. 【F:src/pages/api/admin/branches.ts†L5-L12】【F:netlify.toml†L13-L24】 |
| Compliance & Privacy | 3 | No audit logs, PII logging, lacks consent tracking. 【F:src/lib/prisma.ts†L12-L20】【F:src/pages/api/admin/reservations.ts†L23-L285】 |
| Billing | 3 | Webhook lacks idempotency/tenant guard; plan entitlements absent. 【F:src/pages/api/stripe/webhook.ts†L24-L135】 |
| Database & Indexing | 3 | Missing composite indexes, incorrect relations (`pkg` alias). 【F:src/pages/api/user/packages.ts†L23-L35】 |
| Performance | 4 | Prisma `findMany` without pagination; potential N+1 but manageable. 【F:src/pages/api/admin/reservations.ts†L134-L225】 |
| Observability | 3 | Prisma logs PII, no structured logging or tracing. 【F:src/lib/prisma.ts†L12-L20】 |
| DX / QA | 4 | Lints available but no automated tests, seed data outdated. 【F:package.json†L7-L43】 |
| Documentation | 5 | README covers setup but lacks API docs; endpoints inventory provided in this audit. 【F:README.md†L6-L74】 |
| Deployment | 5 | Netlify config exists but secrets exposed; no CI gating migrations. 【F:netlify.toml†L13-L24】 |

**Overall SaaS Readiness Score:** 33 / 100

### Heat Map of Critical Findings
| ID | Area | Severity | Description | Impact | Quick Win? |
|----|------|----------|-------------|--------|------------|
| A1 | Access Control | Critical | Admin/therapist APIs exposed without auth | Cross-clinic data leak | ✅ |
| A2 | Secrets | High | Production keys in repo | Account takeover | ✅ |
| A3 | Tenancy | Critical | No tenant keys or scoping | Impossible to isolate clinics | ❌ |
| A4 | Billing | High | Stripe webhook lacks idempotency/tenant guard | Billing fraud / duplicates | ❌ |
| A5 | Validation | High | Reset endpoints lack rate limit | Account compromise | ❌ |

See `audit/security_findings.json` for full OWASP mapping and recommendations.

## 1. Inventory Highlights
- **Frameworks & Tooling**: Next.js 15 / React 19, NextAuth credentials, Prisma 6, Stripe SDK 18, React Query 5. 【F:package.json†L7-L43】
- **Backend API Surface**: 48 API methods enumerated in `audit/endpoints.csv`, covering admin, therapist, user, Stripe, and auth flows.
- **Frontend Components**: Dashboard, admin, therapist layouts and forms under `src/components`. Key contexts/hooks limited to `useAdminStats`. 【F:src/components/admin/TherapistsSection.tsx†L1-L200】【F:src/hooks/useAdminStats.ts†L1-L200】
- **Data Models**: Prisma schema defines Users, Therapists, Branches, Packages, UserPackages, Reservations, PasswordResetToken without tenant fields or service tables referenced elsewhere. 【F:prisma/schema.prisma†L12-L99】【F:src/pages/api/admin/services.ts†L18-L28】
- **Migrations**: Present in `prisma/migrations` but align with single-tenant schema (manual review recommended before future changes).

## 2. Tenancy Readiness
- **Schema gaps**: None of the models include `clinicId`. Admin APIs query entire tables, making data separation impossible. 【F:prisma/schema.prisma†L12-L99】【F:src/pages/api/admin/clients/index.ts†L20-L50】
- **Query scoping**: Nearly every Prisma query lacks tenant filters; e.g., package listing returns all records. 【F:src/pages/api/packages.ts†L18-L27】
- **Middleware absence**: Prisma client logs queries but does not enforce tenant context. 【F:src/lib/prisma.ts†L12-L20】
- **Plan**: Adopt AsyncLocalStorage-based middleware + Postgres RLS (see `mt-plan.md`) and run Playwright leak tests (see `migration_playbook.md`).

## 3. Security & Compliance (OWASP ASVS L2)
- **Access Control**: Unauthenticated access to admin endpoints (`/api/admin/branches`, `/api/admin/availability`) exposes schedules and branch data. 【F:src/pages/api/admin/branches.ts†L5-L12】【F:src/pages/api/admin/availability.ts†L9-L121】
- **Secrets management**: Netlify configuration hardcodes production secrets (Stripe, NEXTAUTH). 【F:netlify.toml†L13-L24】
- **Authentication**: NextAuth uses bcrypt but sessions are 24h without refresh rotation; password reset endpoints lack throttling. 【F:src/pages/api/auth/[...nextauth].ts†L9-L45】【F:src/pages/api/auth/request-token.ts†L6-L43】
- **Authorization**: Role checks exist in some handlers but rely on inconsistent role strings ("CLIENT" vs "CLIENTE"). 【F:src/pages/api/admin/stats.ts†L37-L57】
- **Validation**: Most routes perform manual truthy checks; no schema validation (Zod) implemented. 【F:src/pages/api/appointments/create.ts†L20-L127】
- **CSRF/CORS**: No explicit CORS headers; NextAuth handles cookies but API routes not protected against CSRF for browser calls.
- **Security Headers**: Next config lacks header injection (see snippet in `migration_playbook.md`). 【F:next.config.mjs†L1-L5】
- **Logging/Audit**: Prisma logs queries with `log: ['query','error']`, leaking PII and lacking audit trail. 【F:src/lib/prisma.ts†L12-L20】
- **Backups & Encryption**: Not documented; recommend Neon PITR configuration and SSE for S3 exports.

## 4. Architecture & Performance
- **N+1 / Heavy queries**: `admin/reservations` performs multiple sequential lookups per reservation, with no pagination. 【F:src/pages/api/admin/reservations.ts†L134-L225】
- **Indexes**: Absent composite indexes on `Reservation.date` + clinic; `User.email` unique global (should be per clinic). 【F:prisma/schema.prisma†L12-L99】
- **Caching & Queues**: No caching layer or async queues for emails/webhooks; recommend Redis/Upstash for rate limits and job queue (BullMQ/SQS).

## 5. Billing & Plans
- **Stripe checkout**: Endpoint lacks auth guard and idempotency; metadata does not include clinic ID. 【F:src/pages/api/stripe/checkout.ts†L9-L32】
- **Webhook handler**: Creates services/therapists with hard-coded passwords and wrong field names (`pkgId` vs `packageId`), without verifying tenant. 【F:src/pages/api/stripe/webhook.ts†L62-L118】
- **Plan enforcement**: No linkage between packages and feature limits; need `ClinicPlan` table plus middleware enforcement.

## 6. Developer Experience & QA
- **Tooling**: NPM scripts available (dev, build, lint, migrate, seed). No automated tests or CI pipelines. 【F:package.json†L7-L36】
- **Type Safety**: Many files are JS/TS mix (e.g., `.jsx` inside components) leading to inconsistent lint coverage.
- **Docs**: README describes setup but lacks API usage examples; add Swagger/OpenAPI or Postman collection.

## 7. Quick Wins (48-72h)
1. **Secure endpoints**: Add NextAuth `getServerSession` checks to `/api/admin/branches`, `/api/admin/availability`, `/api/therapist/[id]/reservations`. Severity: Critical. Effort: 6h. Quick win ✅.
2. **Rotate secrets**: Remove secrets from `netlify.toml`, rotate in Netlify dashboard. Severity: High. Effort: 4h. Quick win ✅.
3. **Implement rate limiting for auth endpoints**: Use Upstash snippet (see `migration_playbook.md`). Severity: High. Effort: 8h. Quick win ✅.
4. **Patch Stripe webhook**: Store `event.id`, validate metadata clinic, use real password provisioning. Severity: High. Effort: 10h. Quick win ⚠️ (depends on metadata availability).

## 8. Sprint Roadmap
- **Sprint 1**: Schema groundwork, security headers, secret rotation, endpoint hardening, add audit logging scaffold.
- **Sprint 2**: Introduce clinicId columns, Prisma middleware (shadow mode), populate data, add rate limits.
- **Sprint 3**: Enable RLS, tenant-aware routing, add per-tenant tests & observability (OpenTelemetry, dashboards).
- **Sprint 4**: Stripe entitlement sync, billing-state enforcement, tenant extraction tooling.

## 9. Deliverables
- `audit/endpoints.csv`: Comprehensive API inventory with auth/validation status.
- `audit/tenancy_gaps.json`: Tenant scoping issues with suggested diffs.
- `audit/security_findings.json`: OWASP mapped security issues.
- `audit/mt-plan.md`: Multi-tenant design with middleware & RLS snippets.
- `audit/migration_playbook.md`: Step-by-step migration + rollback + tests.
- `audit/observability.md`: Logging, metrics, alerting plan.
- `audit/stripe_checklist.md`: Billing/webhook checklist.

## 10. Next Steps
- Review quick wins with engineering team and schedule immediate fixes.
- Approve multi-sprint roadmap and allocate resources (DBA, security engineer, backend lead).
- Establish recurring audit checkpoints (bi-weekly) to track progress towards SaaS readiness target ≥ 75/100.

