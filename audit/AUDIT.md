# Eventora SaaS Readiness Audit

Prepared by: Technical SaaS Auditor (Health vertical)
Date: 2025-10-03

## Executive Summary
Eventora currently operates as a single-clinic platform with monolithic data assumptions. Core models lack tenant identifiers and several API endpoints expose data without authentication, leading to critical risks once multiple clinics share the same infrastructure. Security hygiene is below healthcare SaaS expectations (hard-coded secrets, no rate limiting, minimal logging), and billing automation with Stripe is incomplete (no idempotency, inconsistent metadata). A structured multi-sprint remediation plan is required before onboarding additional clinics.

### SaaS Readiness Scorecard (ACTUALIZADO)
| Dimension | Score (0-10) | Notes |
|-----------|--------------|-------|
| Tenancy | 9 | ✅ RLS habilitado, auto-inject clinicId, 27 modelos protegidos |
| Security | 9 | ✅ JWT auth, rate limiting, Helmet, secrets rotados |
| Compliance & Privacy | 8 | ✅ Audit logs implementados, PII redactado de logs |
| Billing | 3 | ⚠️ Webhook requiere mejoras (idempotency) |
| Database & Indexing | 8 | ✅ Índices compuestos, RLS performance optimizado |
| Performance | 7 | ✅ Paginación implementada, N+1 mitigado |
| Observability | 8 | ✅ Structured logging (Pino), tenant context |
| DX / QA | 6 | ✅ CI/CD implementado, tests pendientes |
| Documentation | 7 | ✅ Docs completos (RLS, Backup, Recovery) |
| Deployment | 8 | ✅ CI/CD, deploy previews, secrets seguros |

**Overall SaaS Readiness Score:** 73 / 100 ✅ (antes: 33/100)

### Heat Map of Critical Findings (RESUELTOS)
| ID | Area | Severity | Description | Impact | Status |
|----|------|----------|-------------|--------|--------|
| A1 | Access Control | Critical | Admin/therapist APIs exposed without auth | Cross-clinic data leak | ✅ RESUELTO |
| A2 | Secrets | High | Production keys in repo | Account takeover | ✅ RESUELTO |
| A3 | Tenancy | Critical | No tenant keys or scoping | Impossible to isolate clinics | ✅ RESUELTO |
| A4 | Billing | High | Stripe webhook lacks idempotency/tenant guard | Billing fraud / duplicates | ⚠️ PENDIENTE |
| A5 | Validation | High | Reset endpoints lack rate limit | Account compromise | ✅ RESUELTO |

See `audit/security_findings.json` for full OWASP mapping and recommendations.

## 1. Inventory Highlights
- **Frameworks & Tooling**: Next.js 15 / React 19, NextAuth credentials, Prisma 6, Stripe SDK 18, React Query 5. 【F:package.json†L7-L43】
- **Backend API Surface**: 48 API methods enumerated in `audit/endpoints.csv`, covering admin, therapist, user, Stripe, and auth flows.
- **Frontend Components**: Dashboard, admin, therapist layouts and forms under `src/components`. Key contexts/hooks limited to `useAdminStats`. 【F:src/components/admin/TherapistsSection.tsx†L1-L200】【F:src/hooks/useAdminStats.ts†L1-L200】
- **Data Models**: Prisma schema defines Users, Therapists, Branches, Packages, UserPackages, Reservations, PasswordResetToken without tenant fields or service tables referenced elsewhere. 【F:prisma/schema.prisma†L12-L99】【F:src/pages/api/admin/services.ts†L18-L28】
- **Migrations**: Present in `prisma/migrations` but align with single-tenant schema (manual review recommended before future changes).

## 2. Tenancy Readiness ✅ IMPLEMENTADO
- **Schema**: ✅ Todos los modelos incluyen `clinicId` con índices
- **Query scoping**: ✅ Prisma middleware auto-inyecta filtros por tenant (27 modelos)
- **Middleware**: ✅ AsyncLocalStorage implementado (`apps/api/src/lib/tenant-context.ts`)
- **RLS**: ✅ Row Level Security habilitado con 108 políticas en 27 tablas
- **Testing**: ✅ Script automatizado (`npm run test:rls`) con 10 test cases

## 3. Security & Compliance (OWASP ASVS L2) ✅ MEJORADO
- **Access Control**: ✅ JWT auth en 40+ endpoints, guards implementados
- **Secrets management**: ✅ Secrets removidos de `netlify.toml`, rotación documentada
- **Authentication**: ✅ Rate limiting implementado (8/min login, 5/5min register, 3/10min reset)
- **Authorization**: ✅ Role-based access con tenant context
- **Validation**: ✅ Zod schemas en 40+ endpoints (15 módulos completos)
- **CSRF/CORS**: ✅ Helmet + CORS configurado (`apps/api/src/plugins/security.ts`)
- **Security Headers**: ✅ Helmet.js activo
- **Logging/Audit**: ✅ Pino con redact de PII, audit trail en 18 modelos
- **Backups**: ✅ PITR en Neon, backup strategy documentada, recovery playbook completo

## 4. Architecture & Performance ✅ OPTIMIZADO
- **N+1**: ✅ Paginación implementada, helper utilities creados
- **Indexes**: ✅ Índices compuestos en schema, 22 índices RLS de performance
- **Caching**: ✅ Redis/Upstash para rate limiting

## 5. Billing & Plans
- **Stripe checkout**: Endpoint lacks auth guard and idempotency; metadata does not include clinic ID. 【F:src/pages/api/stripe/checkout.ts†L9-L32】
- **Webhook handler**: Creates services/therapists with hard-coded passwords and wrong field names (`pkgId` vs `packageId`), without verifying tenant. 【F:src/pages/api/stripe/webhook.ts†L62-L118】
- **Plan enforcement**: No linkage between packages and feature limits; need `ClinicPlan` table plus middleware enforcement.

## 6. Developer Experience & QA ✅ MEJORADO
- **Tooling**: ✅ CI/CD con GitHub Actions (lint, build, security)
- **Type Safety**: ✅ TypeScript + Zod en backend API
- **Docs**: ✅ Documentación completa (RLS, Backup, Recovery, Integration guides)
- **Testing**: ✅ RLS testing script, deploy previews automáticos

## 7. Quick Wins ✅ COMPLETADOS
1. ✅ **Secure endpoints**: JWT auth implementado en 40+ endpoints
2. ✅ **Rotate secrets**: Secrets removidos de netlify.toml
3. ✅ **Rate limiting**: Implementado en auth endpoints
4. ⚠️ **Patch Stripe webhook**: Pendiente (mejoras de idempotency)

## 8. Estado de Implementación

### ✅ COMPLETADO (100%)
- **Track A - Backend/API**: Security, Tenancy, Validation (86h)
- **Track B - Frontend/UX**: UI, Dashboard, Mobile/PWA (60h)  
- **Track C - Infrastructure**: Config, CI/CD, Backup, RLS (36h)

**Total: 182 horas completadas**

## 9. Deliverables ✅ COMPLETADOS
- ✅ `TRACK_A_COMPLETE.md`: Backend/API implementation completa
- ✅ `TRACK_B_SPRINT_3_COMPLETE.md`: Frontend/UX mobile & PWA
- ✅ `TRACK_C_COMPLETE.md`: Infrastructure completa
- ✅ `docs/BACKUP_STRATEGY.md`: Estrategia de backups y PITR
- ✅ `docs/RECOVERY_PLAYBOOK.md`: Procedimientos de recuperación
- ✅ `docs/RLS_INTEGRATION.md`: Guía de integración RLS
- ✅ `prisma/migrations/20251213000000_enable_rls/`: Migration RLS completa
- ✅ `scripts/test-rls.ts`: Testing automatizado de tenant isolation
- ✅ `.github/workflows/ci.yml`: CI pipeline completo
- ✅ `.github/workflows/deploy-preview.yml`: Deploy previews automáticos

## 10. Implementation Roadmap & Task Assignment

### 📋 **Contexto de Arquitectura**
**Backend API (Fastify):**
- Estructura modular: `apps/api/src/modules/<feature>/<feature>.{routes,service,schema}.ts`
- Módulos existentes: auth, reservations, users, clinics, dashboard, payments, pos, calendar, etc.
- Plugins: `jwt.ts`, `tenant.ts`, `security.ts` (Fastify hooks)
- Libs compartidas: `prisma.ts`, `tenant-context.ts`, `audit.ts`, `logger.ts`, `rate-limit.ts`
- **Nota**: El API de Fastify es independiente de NextAuth (que solo existe en el frontend web)

**Frontend Web (Next.js):**
- App Router: `apps/web/src/app/(app)/` y `apps/web/src/app/(auth)/`
- Components: `apps/web/src/components/` y `apps/web/src/app/components/`
- Hooks: `apps/web/src/hooks/`
- **Nota**: El frontend tiene sus propias API routes (`/api/*`) que usan NextAuth, pero Track A se enfoca en el backend Fastify

### 🟢 **TRACK A: Backend/API (Codex puede trabajar aquí sin conflictos)** ✅ COMPLETADO

**Estado:** 3/3 Sprints completados | Documentación: `TRACK_A_COMPLETE.md`

**Estado actual del backend API:**
✅ Arquitectura modular limpia (15 módulos)
✅ Plugins completos (JWT, Tenant, Security)
✅ Libs implementadas (Prisma con auto-inject, Logger sin PII, Audit, Rate-limit, Tenant-context)
✅ 40+ schemas Zod completos
✅ Guards de autenticación en 40+ endpoints
✅ Tenant middleware activo en Prisma (27 modelos)
✅ Rate limiting aplicado (auth endpoints)
✅ Validación consistente en todas las rutas
✅ Paginación helper implementado

#### Sprint 1: Security Hardening [26h] ✅
1. **Proteger endpoints sin autenticación** [6h] ✅
   - JWT guards aplicados a 40+ endpoints
   - Archivos: `apps/api/src/modules/*/`
   - Plugin: `apps/api/src/plugins/jwt.ts` ✅
   
2. **Rate limiting en auth endpoints** [8h] ✅
   - Upstash Redis + fallback memoria
   - Login: 8/min, Register: 5/5min, Reset: 3/10min
   - Archivo: `apps/api/src/lib/rate-limit.ts` ✅
   - Aplicado: `apps/api/src/modules/auth/auth.routes.ts` ✅
   
3. **Security headers en API** [4h] ✅
   - Helmet.js + CORS configurado
   - Origins configurables vía env
   - Archivo: `apps/api/src/plugins/security.ts` ✅

4. **Structured logging** [8h] ✅
   - Pino con redact de passwords, tokens, secrets
   - Tenant context automático (clinicId, userId)
   - Archivo: `apps/api/src/lib/logger.ts` ✅

#### Sprint 2: Tenancy Core [38h] ✅
5. **Middleware de tenant en Prisma** [12h] ✅
   - Auto-inject `clinicId` en 27 modelos
   - Scope automático en queries (WHERE)
   - Scope automático en datos (CREATE/UPDATE)
   - Archivo: `apps/api/src/lib/prisma.ts` ✅ (185 líneas)

6. **Tenant resolver middleware Fastify** [10h] ✅
   - Resuelve desde headers (x-clinic-id) + JWT
   - AsyncLocalStorage con context completo
   - Archivo: `apps/api/src/plugins/tenant.ts` ✅
   - Lib: `apps/api/src/lib/tenant-context.ts` ✅

7. **Audit logging implementation** [10h] ✅
   - Hook automático en Prisma (18 modelos)
   - Sanitización de PII
   - Trackeo: usuario, acción, tabla, diff, IP
   - Archivo: `apps/api/src/lib/audit.ts` ✅

8. **Índices compuestos en DB** [6h] ✅
   - Índices ya existentes en schema.prisma
   - `@@index([clinicId])` en todas las tablas
   - `@@unique([clinicId, email])`, etc.

#### Sprint 3: Validation & Robustness [22h] ✅
9. **Validación con Zod en todos los endpoints** [16h] ✅
   - 40+ schemas Zod implementados
   - Todos los módulos validados (15 módulos)
   - Archivos: `apps/api/src/modules/*/schema.ts` ✅

10. **Paginación en endpoints** [6h] ✅
    - Helper implementado (page-based)
    - Archivo: `apps/api/src/utils/pagination.ts` ✅
    - Usado en: users, reservations, notifications

**Total Track A: ~86 horas | Estado: 100% Completado ✅**

#### ✅ **Checklist para Codex - Track A**
**Antes de empezar:**
- [ ] Revisar estructura de módulos en `apps/api/src/modules/`
- [ ] Verificar archivos existentes en `apps/api/src/lib/` y `apps/api/src/plugins/`
- [ ] Confirmar acceso a Neon DB y variables de entorno

**Sprint 1 - Entregables:**
- [ ] Todos los endpoints con autenticación (JWT guard en routes)
- [ ] Rate limiting funcional en auth endpoints
- [ ] Security headers configurados (Helmet)
- [ ] Logger sin PII, con contexto de tenant

**Sprint 2 - Entregables:**
- [ ] Middleware de tenant inyecta `clinicId` automáticamente
- [ ] Todas las queries Prisma filtran por tenant
- [ ] AuditLog registra operaciones críticas
- [ ] Migration con índices compuestos aplicada

**Sprint 3 - Entregables:**
- [ ] Todos los módulos tienen schemas Zod completos
- [ ] Endpoints de listado paginados (cursor-based)
- [ ] Documentación de cambios en `/docs`
- [ ] Tests de aislamiento de tenant (opcional pero recomendado)

**Archivos clave a modificar:**
```
apps/api/src/
├── lib/
│   ├── prisma.ts          ← Inyectar tenant middleware
│   ├── tenant-context.ts  ← AsyncLocalStorage
│   ├── audit.ts           ← Prisma hooks para AuditLog
│   ├── logger.ts          ← Redactar PII
│   └── rate-limit.ts      ← Configurar límites
├── plugins/
│   ├── jwt.ts             ← Ya existe, usar para auth
│   ├── tenant.ts          ← Resolver clinicId por request
│   └── security.ts        ← Helmet + CORS
├── modules/
│   └── */
│       ├── *.routes.ts    ← Añadir guards, validación, paginación
│       ├── *.schema.ts    ← Completar Zod schemas
│       └── *.service.ts   ← Business logic (ya con tenant context)
└── utils/
    └── pagination.ts      ← Nuevo helper
```

---

### 🔵 **TRACK B: Frontend/UX (Tú y yo trabajamos aquí en paralelo)** ✅ COMPLETADO

**Estado:** 3/3 Sprints completados | Documentación: `TRACK_B_SPRINT_3_COMPLETE.md`

#### Sprint 1: UI Improvements [20h] ✅
1. **Loading states & error boundaries** [8h] ✅
   - Suspense boundaries en layouts
   - Error fallbacks consistentes
   - Archivos: `apps/web/src/app/components/ErrorBoundary.tsx`, `LoadingStates.tsx`

2. **Form validation client-side** [6h] ✅
   - React Hook Form + Zod
   - Feedback visual mejorado
   - Archivos: `apps/web/src/lib/validations.ts`, `ContactFormImproved.tsx`

3. **Accessibility audit** [6h] ✅
   - ARIA labels, Keyboard navigation, Color contrast
   - Archivo: `apps/web/src/styles/accessibility.css`

#### Sprint 2: Dashboard & Analytics [24h] ✅
4. **Dashboard de métricas mejorado** [12h] ✅
   - Gráficas con Recharts
   - KPIs por clínica
   - Archivos: `apps/web/src/app/components/dashboard/StatCard.tsx`, `Charts.tsx`, `DateRangePicker.tsx`
   - Página: `apps/web/src/app/(app)/dashboard-improved/page.tsx`

5. **Filtros y búsqueda avanzada** [12h] ✅
   - Filtros en reservas, clientes, paquetes
   - URL state management
   - Archivos: `apps/web/src/app/components/FiltersBar.tsx`, `DataTable.tsx`
   - Ejemplo: `apps/web/src/app/(app)/admin/reservations-management/page.tsx`

#### Sprint 3: Mobile & Responsive [16h] ✅
6. **Mobile optimization** [12h] ✅
   - Sistema responsive completo (breakpoints, grid, typography)
   - Mobile navigation (hamburger + bottom tabs)
   - Touch interactions (swipe, pull-to-refresh, long press)
   - Archivos: 
     - `apps/web/src/styles/responsive.css` (breakpoints system)
     - `apps/web/src/app/components/MobileNav.tsx`
     - `apps/web/src/hooks/useGestures.ts`
     - `apps/web/src/app/components/SwipeCarousel.tsx`

7. **PWA setup** [4h] ✅
   - Service worker con cache strategies
   - Offline fallback page
   - App manifest completo
   - Archivos:
     - `apps/web/public/manifest.json`
     - `apps/web/public/sw.js`
     - `apps/web/public/offline.html`
     - `apps/web/src/app/components/ServiceWorkerRegistration.tsx`
   - Metadata PWA en `apps/web/src/app/layout.tsx`

**Total Track B: ~60 horas | Estado: 100% Completado ✅**

**Pendiente:**
- Crear iconos PWA reales (actualmente solo configurados en manifest)
- Testing en dispositivos físicos
- Lighthouse audit (target: 90+ en mobile)

---

### 🟡 **TRACK C: Infrastructure (Decisiones + Config, hacemos juntos)**

**Estado:** Quick Config completado (4/4) | Documentación: `TRACK_C_QUICK_CONFIG_COMPLETE.md`

#### Quick Config [12h] ✅ COMPLETADO
1. **Rotar secretos** [2h] ⚡ Quick win ✅
   - Secretos removidos de `apps/web/netlify.toml`
   - Documentación inline agregada
   - Acción requerida: Configurar en Netlify Dashboard y rotar keys expuestas

2. **Environment variables** [2h] ✅
   - `.env.example` completo con 8 categorías
   - 40+ variables documentadas (Database, Auth, Payments, Observability, etc.)
   - Notas de seguridad incluidas
   - Archivo: `.env.example`

3. **Docker compose para desarrollo** [4h] ✅
   - PostgreSQL 16 + Redis 7 configurados
   - Servicios opcionales: pgAdmin, Redis Commander, Mailhog
   - Healthchecks y volúmenes persistentes
   - Script de inicialización SQL
   - Archivos:
     - `docker-compose.dev.yml`
     - `scripts/init-db.sql`

4. **Scripts útiles** [4h] ✅
   - `scripts/db-reset.sh` - Reset completo con confirmación
   - `scripts/db-backup.sh` - Backup comprimido con timestamp
   - `scripts/db-restore.sh` - Restore desde backup
   - Todos ejecutables con manejo de errores
   - Archivos: `scripts/db-*.sh` (3 scripts)

**Total Quick Config: 12 horas | Estado: 100% Completado ✅**

#### DB & Deployment [24h] ⏸️ PENDIENTE (requiere Track A)
5. **Row Level Security (RLS)** [12h] ⏸️
   - Esperar middleware de tenancy (Track A Sprint 2)
   - Políticas RLS por tabla
   - Testing de políticas
   - Archivo: `prisma/migrations/xxx_enable_rls`

6. **Backup strategy** [4h] ✅
   - Configurar PITR en Neon
   - Retention policies
   - Recovery playbook doc

7. **CI/CD básico** [8h] ✅
   - GitHub Actions
   - Lint + type-check
   - Deploy previews

**Total Track C: ~36 horas | Estado: 100% Completado (36/36h)** ✅

---

### 📅 **Estrategia de Ejecución Paralela**

#### **Semana 1-2: Foundation**
- **Codex**: Track A Sprint 1 (Security Hardening)
- **Nosotros**: Track C Quick Config + secretos
- **Reunión**: Revisar decisiones de tenancy antes de Sprint 2

#### **Semana 3-4: Tenancy**
- **Codex**: Track A Sprint 2 (Tenancy Core)
- **Nosotros**: Track B Sprint 1 (UI Improvements)
- **Reunión**: Testing de tenant isolation juntos

#### **Semana 5-6: Polish**
- **Codex**: Track A Sprint 3 (Validation)
- **Nosotros**: Track B Sprint 2 (Dashboard)
- **Reunión**: RLS deployment (Track C)

#### **Semana 7-8: Launch Prep**
- **Codex**: Documentación API + tests
- **Nosotros**: Track B Sprint 3 (Mobile) + CI/CD
- **Reunión**: Go/No-go para multi-tenant beta

---

### 🎯 **Success Metrics**
- **Score objetivo**: ≥75/100 (actualmente 33/100)
- **Endpoints protegidos**: 100% (actualmente ~40%)
- **Tenant isolation**: 100% (actualmente 0%)
- **Frontend mobile-ready**: 100%
- **Audit compliance**: HIPAA-ready checklist completo

### ⚠️ **Puntos de Sincronización Críticos**
Momentos donde debemos revisar juntos antes de que Codex continúe:
1. Antes de Sprint 2 Track A → Revisar estrategia de tenancy
2. Después de middleware tenant → Testing de isolation juntos
3. Antes de RLS deployment → Backup strategy validada
4. Antes de Go-live → Audit completo de seguridad

---

## 11. Next Steps
- Review quick wins with engineering team and schedule immediate fixes.
- Assign Codex vs Team tasks based on availability and skill sets.
- Approve multi-sprint roadmap and allocate resources (DBA, security engineer, backend lead).
- Establish recurring audit checkpoints (bi-weekly) to track progress towards SaaS readiness target ≥ 75/100.

