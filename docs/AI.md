# Eventora — AI Operating Manual

> **Última actualización:** 20 enero 2026  
> **Estado del proyecto:** MVP funcional, tareas A y B completadas, lanzamiento 24 enero 2026

## Estado Actual de Tareas

### ✅ Tareas A (Críticas) - COMPLETADAS
- A1: Landing Page con Pricing
- A2: Signup + Checkout Flow  
- A3: Onboarding Success
- A4: Dashboard Principal
- A5: CRUD Servicios UI (`/apps/web/src/app/(app)/services/page.tsx`)
- A6: CRUD Membresías UI (`/apps/web/src/app/(app)/memberships/page.tsx`)
- A7: Vender Membresía (`/apps/web/src/app/(app)/memberships/subscriptions/page.tsx`)
- A8: Stripe Connect UI (`/apps/web/src/app/(app)/settings/payments/page.tsx`)
- A9: Widget de Booking (`/apps/web/src/app/book/[slug]/page.tsx`)
- A10: Checkout Cliente (`/apps/web/src/app/book/[slug]/checkout/page.tsx`)

### ✅ Tareas B (Importantes) - COMPLETADAS
- B1: Emails Transaccionales (`transactionalEmail.service.ts`)
- B2: Calendario Visual (`/apps/web/src/app/(app)/calendar/page.tsx`)
- B3: Gestión de Clientes (`/apps/web/src/app/(app)/clients/page.tsx`)
- B4: Reportes Básicos (`/apps/web/src/app/(app)/reports/page.tsx`)
- B5: Settings del Workspace (`/apps/web/src/app/(app)/settings/page.tsx`)
- B6: Check-in Manual (en modal de reservación del calendario)

### ⏳ Tareas C (Post-MVP) - PENDIENTES
- C1-C6: Ver ROADMAP_LAUNCH.md para detalles

---

## Objetivo del producto (congelado)

Eventora es un SaaS multi-tenant premium para negocios wellness basados en horarios:
- **CLASE** (capacidad N participantes)
- **SESIÓN** (capacidad 1, cita individual)

Optimiza: **Visibilidad → Conversión → Operación → Retención**

### KPIs Core (mínimos para lanzamiento)

| Métrica | Definición | Meta MVP |
|---------|------------|----------|
| **Ocupación** | reservas confirmadas / capacidad total | > 60% |
| **No-show rate** | no-shows / reservas confirmadas | < 15% |
| **Time-to-cash** | minutos desde reserva → pago conciliado | < 5 min |

## Regla de oro

> Si una tarea **NO mejora ocupación, no-shows o time-to-cash** (o es infraestructura necesaria para ello), va a **Post-MVP**.

---

## Stack Técnico Actual

### Backend
```
Fastify 4.29 + TypeScript 5.8
Prisma 6.2 + PostgreSQL 15 (Supabase)
JWT auth + 2FA email
Stripe + MercadoPago + Cash
Resend email
Upstash Redis (rate limiting)
```

### Frontend
```
Next.js 16 + React 19
TailwindCSS + CSS Modules
React Query v5 (TanStack)
FullCalendar 6
```

---

## Roles de agentes (modo "equipo")

| Rol | Responsabilidad |
|-----|-----------------|
| **Planner** | Descompone ticket en subtareas, identifica riesgos y dependencias, define criterios |
| **Implementer** | Escribe código, tests mínimos, migraciones y actualiza docs/ticket |
| **Reviewer** | Revisa seguridad, multi-tenant, RBAC, UX consistency, performance |
| **QA** | Ejecuta checklist, prueba flujos críticos e2e, valida DoD |

---

## Protocolo de trabajo por ticket

1. Lee `AI.md` + ticket completo
2. Escribe plan corto (máx 15 bullets) en sección "Plan" del ticket
3. Implementa en commits pequeños y descriptivos
4. Ejecuta checks obligatorios:
   - `npm run lint` + `npm run typecheck`
   - Unit/integration tests donde aplique
   - Prueba manual del flujo
5. Actualiza ticket con:
   - "Files touched"
   - "Test evidence"
   - "Security checks"
   - "UX checks"
6. Si hay decisiones arquitectónicas → registra en `/docs/DECISIONS.md` o ADR

---

## Guardrails NO negociables

### Multi-tenant
- ✅ Toda entidad persiste `clinicId` (tenant)
- ✅ Toda query server-side filtra por `clinicId`
- ✅ Nunca confíes en tenantId del cliente: deriva de sesión/token + guard
- ✅ Prisma middleware en `apps/api/src/lib/prisma.ts` con AsyncLocalStorage

### RBAC
Roles: `ADMIN`, `MANAGER`, `RECEPTION`, `THERAPIST`, `CLIENT`

| Rol | Acceso |
|-----|--------|
| ADMIN | Todo |
| MANAGER | Todo excepto billing SaaS |
| RECEPTION | Reservas, clientes, check-in |
| THERAPIST | Su agenda, sus reservas |
| CLIENT | Sus reservas, su perfil |

- ✅ Todo endpoint valida rol via `app.authenticate`
- ✅ Frontdesk no puede tocar billing/planes
- ✅ Client no puede ver datos de otros clientes

### Seguridad (Implementada 19 ene 2026)
- ✅ CORS habilitado con headers permitidos
- ✅ Helmet (CSP, XSS protection, etc.)
- ✅ Validación server-side con Zod
- ✅ Rate limit en auth (5/min) y reservas (10/min)
- ✅ Secrets nunca en frontend
- ✅ Logs sin PII sensible (sanitizar)
- ✅ Webhooks Stripe verifican firma
- ✅ JWT con expiración 1h

### Calidad
- ❌ Ningún "TODO" crítico en MVP
- ✅ Manejo de errores consistente (error boundaries + logs)
- ✅ UI consistente con design tokens (ver `DESIGN_SYSTEM.md`)
- ⚠️ Accesibilidad: keyboard nav, focus states, aria labels (revisar)

---

## Estándar UX/UI (Apple-like)

- Spacing generoso, tipografía clara
- Estados vacíos útiles (no "no data" — siempre CTA)
- Skeleton loaders y feedback inmediato
- Microinteracciones 150–250ms
- Nada chillón. Nada saturado.
- Seguir `/EVENTORA_BRAND_GUIDELINES.md`

---

## Definition of Done (DoD) por ticket

- [ ] Cumple criterios de aceptación
- [ ] Multi-tenant + RBAC correctos
- [ ] Validación server-side + manejo de errores
- [ ] Tests mínimos o evidencia de prueba manual
- [ ] UI consistente (tokens) + accesible
- [ ] Documentación/ticket actualizado
- [ ] TypeScript compila sin errores

---

## Convenciones de commits

```
feat(module): descripción corta [T-XXXX]
fix(module): descripción corta [T-XXXX]
chore: descripción corta
docs: actualización de documentación
```

Ejemplos:
```
feat(auth): add rate limiting to login [T-0002]
fix(reservations): prevent double booking [T-0003]
chore: update dependencies
```

---

## "Stop conditions"

El agente **DEBE detenerse** y registrar en ticket si:
- Hay ambigüedad que afecte seguridad o datos
- Hay decisión de arquitectura (registrar ADR)
- Falta info para completar criterios de aceptación
- Se requiere acceso a servicios externos (credenciales)

---

## Archivos de referencia

| Archivo | Propósito |
|---------|-----------|
| `/docs/ROADMAP.md` | Estado actual y prioridades |
| `/docs/SECURITY.md` | Baseline de seguridad |
| `/docs/DESIGN_SYSTEM.md` | Tokens y componentes |
| `/docs/DECISIONS.md` | Log de decisiones |
| `/EVENTORA_BRAND_GUIDELINES.md` | Branding y colores |
| `/prisma/schema.prisma` | Modelo de datos |

---

*Este documento es la fuente de verdad para agentes AI trabajando en Eventora.*
