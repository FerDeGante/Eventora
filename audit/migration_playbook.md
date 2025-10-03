# Migration Playbook — Single Clinic to Multi-Tenant

## Overview
Goal: refactor Bloom from a single-clinic deployment to a tenant-aware SaaS while maintaining uptime and regulatory compliance.

## Prerequisites
- Inventory of all production data (backup + anonymised sample for staging).
- Feature flags available (e.g., LaunchDarkly or custom toggle table) to gate tenant rollout.
- CI/CD pipeline capable of running Prisma migrations per environment.
- Observability baseline (logs/metrics) to detect regression post-migration.

## Phase 0 — Preparation (1 sprint)
1. **Code freeze guardrails**: introduce feature flag `tenancy_enabled` default `false` in config.
2. **Schema groundwork**:
   - Create `Clinic` model with metadata.
   - Add optional `clinicId` columns to all models with default pointing to legacy clinic.
   - Generate and run Prisma migration on staging. Validate with sample data.
3. **Context wiring**: add AsyncLocalStorage tenant context + `runWithTenant` helper (see `mt-plan.md`).
4. **Security headers**: update `next.config.mjs` to emit secure defaults (see snippet below) before traffic split.

```ts
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.stripe.com" 
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

## Phase 1 — Dual Write & Backfill (Sprint 2)
1. Deploy schema migration adding `clinicId` (nullable) + indexes.
2. Introduce Prisma middleware in shadow mode: if `tenancy_enabled` is false, skip enforcement but log queries missing `clinicId`.
3. Build CLI script to populate `clinicId` for existing records (`UPDATE ... SET clinic_id = :legacyClinic`).
4. Run script in staging, verify with integration tests, then execute in production during low traffic window.
5. Enable database constraints (`NOT NULL`, composite unique) after data backfill passes checks.

## Phase 2 — Enforce Tenancy (Sprint 3)
1. Flip feature flag in staging to enable middleware enforcement + RLS. Run regression tests.
2. Deploy to production with flag off. Run smoke tests.
3. Toggle flag for a pilot tenant (new clinic) while legacy clinic remains default.
4. Monitor metrics (error rates, response time) and audit logs for 24h.
5. Gradually migrate legacy clinic by assigning actual `clinicId` to session tokens and enabling flag.

## Phase 3 — Billing & Tenant Extraction (Sprint 4)
1. Update Stripe checkout metadata to include `clinicId` and plan tier. Validate via webhook replay tests.
2. Implement tenant-aware rate limiting:
   ```ts
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const redis = Redis.fromEnv();
   export const perTenantLimiter = new Ratelimit({
     redis,
     limiter: Ratelimit.slidingWindow(100, '1 m'),
     analytics: true,
   });

   export async function assertTenantBudget(tenantId: string, identifier: string) {
     const { success, reset } = await perTenantLimiter.limit(`${tenantId}:${identifier}`);
     if (!success) {
       throw new Error(`Rate limit exceeded, retry after ${reset}`);
     }
   }
   ```
3. Build extraction automation (see `mt-plan.md`). Document runbooks for enterprise onboarding.

## Rollback Strategy
- Each migration tagged; keep `prisma migrate resolve --rolled-back` ready.
- Before enforcement, take full database snapshot (Neon branch). To rollback: point app to snapshot, redeploy previous commit, clear feature flag.
- Maintain script to drop RLS policies and revert middleware toggle if breaking change occurs.

## Quality Gates
- **Unit/Integration**: add Prisma tests that fail when `clinicId` missing.
- **E2E leakage test (Playwright)**:
  ```ts
  test('Tenant isolation between A and B', async ({ request }) => {
    const tenantA = await loginAsClinic('alpha');
    const tenantB = await loginAsClinic('beta');

    const create = await request.post('/api/appointments/create', {
      headers: { 'x-clinic-id': tenantA.id, cookie: tenantA.cookie },
      data: { paquete: 'pkg-alpha', terapeuta: 'thera-1', branchId: 'branch-A', date: '2025-01-10', hour: '10:00' }
    });
    expect(create.ok()).toBeTruthy();

    const listB = await request.get('/api/appointments', {
      headers: { 'x-clinic-id': tenantB.id, cookie: tenantB.cookie }
    });
    const body = await listB.json();
    expect(body.reservations).toEqual([]);
  });
  ```
- **Load testing**: run k6/Gatling script per tenant to confirm indexes avoid N+1 and latency spikes.
- **Compliance**: update Record of Processing Activities (ROPA) documenting tenant data flows.

## Communication Plan
- Notify clinics of maintenance windows for data backfill.
- Provide updated SLA/SLO definitions including tenant-specific uptime metrics.
- Share migration timeline with support & legal for incident readiness.

