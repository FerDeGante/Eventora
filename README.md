# Eventora (Relativum)
**Reservas + cobro** para negocios wellness basados en horarios.  
Convierte "me escribieron por Instagram" en "reservaron y pagaron" sin Excel, sin papel, sin caos.

> Eventora es un SaaS multi-tenant premium (Apple-like) para:
> - **CLASES** (capacidad N): indoor cycling, pilates, yoga, barre, HIIT, etc.
> - **SESIONES** (capacidad 1): fisio, estimulación, masajes, etc.
> Mismo motor. Solo cambia la regla de capacidad.

---

## Qué problema resuelve (la realidad del mercado)
La mayoría de estudios/clínicas wellness gestionan reservas con **papel, Excel o WhatsApp**:
- No hay control real de cupo/asistencia
- No hay visibilidad clara de horarios/servicios (dependen de Instagram)
- No hay mecanismo de cobro rápido (depósitos/pagos integrados)
- Se pierden clientes nuevos por fricción

Eventora sistematiza el flujo:
**Visibilidad → Conversión → Operación → Retención**

---

## Promesa (medible y defendible)
Eventora mejora ingresos y velocidad de cobro mediante:
- **Mayor ocupación** (mejor utilización de cupo/agenda)
- **Menos no-shows** (recordatorios + políticas + depósitos)
- **Menor time-to-cash** (pagos integrados + conciliación)

### KPIs (con fórmula)
- **Ocupación** = reservas confirmadas / capacidad total
- **No-show rate** = no-shows / reservas confirmadas
- **Time-to-cash** = minutos desde reserva confirmada → pago registrado/conciliado

> Si se usa un claim tipo "40%", debe estar amarrado a uno de estos KPIs y visualizarse en dashboards.

---

## MVP (alcance de lanzamiento)
### 1) Motor de reservaciones (Core)
- Modos: **Clase (N)** y **Sesión (1)**
- Disponibilidad real: horarios, bloqueos, buffers, excepciones
- Políticas: cancelación/reprogramación, tolerancia
- Waitlist para clases llenas
- Estados de reserva: pending/confirmed/cancelled/completed/no-show
- **Check-in / Check-out** operativo

### 2) Pagos y cobro rápido
- Stripe Checkout (pago total o depósito)
- Registro de pago en sitio (frontdesk)
- Webhooks Stripe (firma + idempotencia) → estados de pago
- Estados de pago vinculados a reservas (paid/unpaid/refunded)

### 3) Membresías + paquetes (credits)
- Suscripciones mensual/anual + customer portal
- Paquetes de credits con expiración
- Ledger auditable de credits (alta/consumo/ajustes/expiración)
- Consumo automático (al reservar o al check-in, configurable)

### 4) Clientes (CRM mínimo)
- Perfil: datos, historial, membresía/credits, notas, tags
- Segmentación: activos / inactivos / riesgo (básico)
- No-show strikes (opcional)

### 5) Emails (Resend)
- Confirmación de reserva
- Recordatorios 24h y 2h antes
- Confirmación de pago
- Cancelación/reprogramación
- Email logs para auditoría

### 6) Dashboards
- Owner: ingresos, ocupación, no-shows, time-to-cash, top servicios
- Frontdesk: agenda del día, check-ins pendientes, cobros pendientes
- Staff: agenda propia + check-in + notas

---

## Fuera de alcance (NO en MVP)
- Directorio/marketplace público para "descubrir estudios"
- Chat interno
- App nativa (PWA después)
- Marketing automation complejo (workflows pro después)
- CFDI / facturación fiscal (módulo separado si aplica)
- POS/inventario avanzado
- Integración WhatsApp provider (después)

---

## Roles (RBAC)
- **ADMIN:** todo (billing, configuración, staff, reportes)
- **MANAGER:** operación y reportes (sin billing SaaS)
- **RECEPTION:** agenda diaria, check-in/out, cobros en sitio
- **THERAPIST:** agenda propia, asistencia, notas internas
- **CLIENT:** reservar, pagar, historial, membresías/credits  
Owner se modela como `Clinic.ownerUserId` (no es un rol separado).

---

## UX/UI (Apple-like, iOS-ish)
- Minimalista, elegante, consistente
- Glass/blur sutil, sombras suaves, spacing generoso
- Microinteracciones 150–250ms, skeletons, estados vacíos útiles
- Accesibilidad real (teclado, aria, contraste)
- Mobile-first (frontdesk operable desde celular)

---

## Stack
- Frontend: Next.js 16 (React 19), React Query v5, TailwindCSS + CSS Modules, FullCalendar 6
- Backend: Fastify 4 + TypeScript, Zod validation, JWT auth + 2FA email
- Data: PostgreSQL 15 (Prisma 6)
- Payments: Stripe (Checkout + Connect), MercadoPago, Cash/POS
- Comms: Resend emails (SMS/Push post-MVP)
- Infra: Upstash Redis (rate limit), Sentry, Docker

---

## Multi-tenant y seguridad (no negociable)
- Toda entidad persiste `clinicId` (tenant)
- Guards en cada query/endpoint/server action (AsyncLocalStorage en Prisma)
- RBAC por rol en cada acción
- Validación server-side (Zod) en mutaciones
- Rate limit en endpoints sensibles
- Webhooks firmados + idempotencia
- AuditLog mínimo: quién cambió reservas/pagos/membresías y cuándo

---

## Sistema de ejecución con IA (obligatorio)
Este repo se ejecuta con un sistema de calidad:
- `/docs/AI.md` — Manual para agentes (guardrails, DoD, protocolo)
- `/docs/ROADMAP.md` — Roadmap con compuertas (gates)
- `/docs/tickets/` — Todo trabajo se hace por ticket (no se codea "sueltamente")
- `/ops/PROGRESS_LOG.md` — Registro diario de avance y riesgos
- `/docs/DECISIONS.md` + `/docs/adr/` — Decisiones de arquitectura documentadas

### Regla
**Ningún agente implementa nada si no existe ticket.  
Ningún ticket se cierra sin DoD + QA checklist.**

---

## Estructura del repo
```
apps/
  api/          ← Backend Fastify + Prisma
  web/          ← Frontend Next.js 16
docs/           ← Documentación técnica
  tickets/      ← Tickets de trabajo
  adr/          ← Architecture Decision Records
prisma/         ← Schema + migrations
scripts/        ← Utilidades (db-reset, db-backup, etc.)
```

---

## Variables de entorno (principales)
- API (`apps/api`): `PORT`, `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `APP_BASE_URL`/`APP_URL`, `CORS_ALLOWED_ORIGINS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Web (`apps/web`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLINIC_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_OBSERVABILITY_URL`
- Compartidas: `DATABASE_URL`, `SENTRY_DSN` (recomendado)

---

## Definition of Done (DoD) para "lanzar y cobrar"
- ✅ Reserva y pago end-to-end (sin pasos manuales)
- ✅ Check-in/out funcional
- ✅ Credits/membresías consumen y registran bien (ledger auditable)
- ✅ Emails transaccionales enviados (confirmación + recordatorios)
- ✅ Dashboards con KPIs mínimos (ocupación, no-show, time-to-cash)
- ✅ Multi-tenant + RBAC correctos
- ✅ Manejo de errores consistente + Sentry
- ✅ UI consistente (tokens + componentes) + accesible
- ✅ Setup reproducible (docs + env + scripts)

---

## Roadmap (gates)
Ver `/docs/ROADMAP.md`.  
El proyecto avanza por compuertas: Foundation → Booking → Payments → Credits → Emails → Dashboards → Hardening → Launch.

---

## Licencia
Privado — Relativum.
