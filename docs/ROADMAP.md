# Eventora Roadmap — Launch Sprint

> Estado actual: MVP funcional (tareas A y B completadas según AI.md)  
> Meta: Lanzamiento operativo sábado 24 de enero 2026  
> Última actualización: 20 enero 2026

---

## 📊 Resumen de Estado

| Área | Progreso | Bloqueantes |
|------|----------|-------------|
| Backend API | 100% MVP | Ninguno (RBAC hardening cubierto T-0009) |
| Base de Datos | 100% MVP | RLS defense-in-depth pendiente (T-0011) |
| Seguridad | 100% | RBAC/tenant tests automatizados listos (T-0009) |
| Frontend Web | 85% | Guardrails RBAC UI + calendario denso pendientes (T-0012, T-0016) |
| Integraciones | 90% | SMS/Push post-MVP |

---

## ✅ Milestone 0 — Foundation (COMPLETADO)
- Monorepo + scripts + env + Prisma + PostgreSQL (Supabase)
- Logging estructurado (Pino) + Sentry error tracking
- Design system tokens + componentes base (EventoraButton, GlowCard, etc.)
- Multi-tenant guard con `clinicId` en todas las tablas
- Rate limiting con Upstash Redis

**Gate:** ✅ Infraestructura lista para producto.

---

## ✅ Milestone 1 — Booking Core (COMPLETADO)
- Servicios con categorías (CLASS|SESSION)
- Disponibilidad real + bloqueos + excepciones
- Crear reserva + estados (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
- Check-in/check-out
- Vista: Wizard de booking (cliente)
- Vista: Dashboard (frontdesk)

**Gate:** ✅ Demo end-to-end sin pagos funcional.

---

## ✅ Milestone 2 — Payments (COMPLETADO)
- Stripe Checkout (pago total + sesiones)
- MercadoPago preferences
- Cash/Terminal (POS físico)
- Webhooks firmados → estados de pago
- Stripe Connect (marketplace B2B)
- Refunds via API

**Gate:** ✅ Reserva → pago → confirmación funciona.

---

## ✅ Milestone 3 — Memberships & Credits (COMPLETADO)
- Planes de membresía (UNLIMITED, SESSIONS_TOTAL, SESSIONS_PERIOD, TIME_BASED)
- Suscripciones + portal de cliente
- Paquetes de créditos + ledger
- Check-in de membresía
- Consumo automático de sesiones

**Gate:** ✅ Reservar con créditos es auditable.

---

## ✅ Milestone 4 — Communications (COMPLETADO)
- Resend templates transaccionales
- Confirmación de reserva
- Recordatorios (configurable)
- Email logs en NotificationTemplate
- SMS/Push: Post-MVP

**Gate:** ✅ Comunicaciones email confiables.

---

## ✅ Milestone 5 — Dashboards & Admin UI (COMPLETADO)
- Dashboard KPIs (ingresos, reservas, paquetes)
- Timeline del día
- POS completo (terminals, printers, shifts)
- Notification templates CRUD
- Wizard de booking funcional con Stripe Checkout
- Página de Clientes `/clients`
- Vista Calendario `/calendar`
- Gestión de Reservas Admin
- Settings de Clínica `/settings`

**Gate:** ✅ KPIs y gestión básica funcional.

---

## 🚧 Milestone 6 — Hardening + Launch (En progreso)
- [T-0009] Hardening RBAC y multi-tenant (tests cross-tenant, roles mínimos por ruta) — ✅
- [T-0010] QA e2e + observabilidad (booking → pago → check-in + emails + Sentry/health) — ✅
- [T-0011] Credenciales productivas + RLS PostgreSQL — 🔴 pendiente (ops)
- [T-0012] Guardrails RBAC en UI + rutas protegidas — 🔴 pendiente
- [T-0013] Instrumentación KPI en booking → checkout → check-in — 🔴 pendiente
- [T-0014] Booking widget + checkout alineados a Design System — ✅
- [T-0015] Copy landing: clase vs sesión + time-to-cash — ✅
- [T-0016] Calendario con FullCalendar + densidad legible — 🔴 pendiente
- Rotar credenciales producción: Supabase, Stripe, Resend, MercadoPago, JWT_SECRET (acción usuario, parte de T-0011)

**Gate:** listo para lanzamiento con cobertura de seguridad y QA.

---

## 🎯 Tickets activos del sprint

### Backend (T-series)
| Ticket | Tarea | Prioridad | Estado |
|--------|-------|-----------|--------|
| T-0008 | Alinear README + ROADMAP | - | DONE |
| T-0009 | Hardening RBAC y multi-tenant | - | DONE |
| T-0010 | QA e2e + observabilidad | - | DONE |
| T-0011 | Credenciales productivas + RLS PostgreSQL | 🔴 P0 | IN_PROGRESS |
| T-0017 | Resolver vulnerabilidades npm (1 crítica RCE) | 🔴 P0 | DONE |
| T-0012 | Guardrails RBAC en UI + rutas protegidas | 🟡 P1 | DONE |
| T-0013 | Instrumentación KPI en booking → checkout → check-in | 🟡 P1 | DONE |
| T-0014 | Booking widget + checkout alineados a Design System | 🟡 P1 | DONE |
| T-0015 | Copy landing: clase vs sesión + time-to-cash | 🟡 P1 | DONE |
| T-0016 | Calendario con FullCalendar + densidad legible | 🟡 P1 | TODO |

### Frontend - Prioridad P0 (CRÍTICO - Bloquea Launch)
| Ticket | Tarea | Días | Estado |
|--------|-------|------|--------|
| FRONT-A1 | Multi-Tenant Guards Frontend | 3 | TODO |
| FRONT-A2 | RBAC Visual Completo | 4 | TODO |
| FRONT-A3 | Check-in / Check-out Flow | 3 | TODO |
| FRONT-A4 | Instrumentación KPIs (time-to-cash) | 2 | TODO |
| FRONT-A5 | Frontdesk Day Sheet | 3 | TODO |
| FRONT-A6 | Booking Wizard - Capacidad N (Clases) | 4 | TODO |
| FRONT-A7 | Wallet / Credits Balance View | 3 | TODO |
| FRONT-A8 | Waitlist Management | 3 | TODO |

### Frontend - Prioridad P1 (Mejoras UX/DX)
| Ticket | Tarea | Días | Estado |
|--------|-------|------|--------|
| FRONT-B1 | Design System Refactor | 5 | TODO |
| FRONT-B2 | Calendar Refactor (1304 LOC → modular) | 5 | TODO |
| FRONT-B3 | Optimistic Updates (React Query) | 2 | TODO |
| FRONT-B4 | Microinteracciones (Framer Motion) | 2 | TODO |
| FRONT-B5 | Accessibility Audit + Fixes | 3 | TODO |

**Health Score:** 42/100 → Target: 85/100 post Sprint 3  
**Ver detalles completos:** [audit/FRONTEND_EXECUTIVE_AUDIT.md](../audit/FRONTEND_EXECUTIVE_AUDIT.md)

---

## 📋 Priorización ABCD — Próximos pasos

### 🔴 A — Críticas (bloquean lanzamiento)
| ID | Tarea | Ticket | Estado | Notas |
|----|-------|--------|--------|-------|
| A1 | Credenciales producción (Stripe/Resend/MP) | T-0011 | TODO | Rotar y cargar vars |
| A2 | JWT_SECRET producción | T-0011 | TODO | 32+ chars, diferente de dev |
| A3 | Supabase keys/RLS policies | T-0011 | TODO | Regenerar y habilitar RLS |
| A4 | Guardrails RBAC UI + rutas protegidas | T-0012 | TODO | Bloquea accesos indebidos |

### 🟡 B — Importantes (mejoran experiencia)
| ID | Tarea | Ticket | Horas | Notas |
|----|-------|--------|-------|-------|
| B1 | RLS policies y test script | T-0011 | 2h | Defense-in-depth opcional si no se activa en A3 |
| B2 | Mejorar onboarding de clínicas (copias/UX) | - | 3h | No bloqueante |
| B3 | Instrumentación KPI booking/checkout/check-in | T-0013 | 3h | Medición time-to-cash/no-show |
| B4 | Booking + checkout alineados a Design System | T-0014 | 6h | ✅ Apple-like consistente |
| B5 | Copy landing clase/sesión + time-to-cash | T-0015 | 2h | ✅ Claridad de nicho |
| B6 | FullCalendar + densidad legible | T-0016 | 6h | Operación más clara |

### 🟢 C — Deseables (Post-lanzamiento)
| ID | Tarea | Horas |
|----|-------|-------|
| C1 | Reportes y Analytics avanzados | 6h |
| C2 | Google Calendar sync bidireccional | 4h |
| C3 | SMS con Twilio | 4h |
| C4 | Push notifications | 6h |
| C5 | PWA móvil | 8h |
| C6 | Multi-idioma | 4h |

### ⚫ D — Eliminar (no hacer ahora)
- App nativa iOS/Android
- API pública con documentación
- Video demo del producto
- Super Admin Dashboard (usar Prisma Studio)
- Analytics avanzados (usar Stripe Dashboard)

---

## 📅 Timeline Lanzamiento
| Fecha | Actividad |
|-------|-----------|
| 19 ene | ✅ Auditoría completa + fixes seguridad |
| 20-21 ene | UI crítica (completada) + cierre de brechas QA |
| 22 ene | QA regression + credenciales reales |
| 23 ene | Soft launch interno |
| **24 ene** | **🚀 LANZAMIENTO OPERATIVO** |

---

## 📚 Documentación Relacionada
- [AI.md](AI.MD) — Manual de operación para agentes AI
- [SECURITY.md](SECURITY.md) — Baseline de seguridad
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Tokens y componentes
- [DECISIONS.md](DECISIONS.md) — Log de decisiones arquitectónicas
- [/adr](adr/) — Architecture Decision Records
- [/docs/tickets](tickets/) — Tickets de trabajo
