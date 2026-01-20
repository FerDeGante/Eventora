# Changelog — Eventora

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Documentación completa en `/docs`
- Sistema de tickets para tracking
- ADR template para decisiones

---

## [0.9.0] - 2026-01-19

### 🔐 Security
- **Helmet.js habilitado** — Headers de seguridad (CSP, X-Frame-Options, etc.)
- **CORS restringido** — Solo dominios permitidos (localhost, eventora.com)
- **Rate limiting** — Upstash Redis con fallback en memoria
- **Protección de endpoints sensibles** — Validación de autorización

### 🐛 Fixed
- **React Query v5 migration** — Corregidos todos los errores de TypeScript
  - `cacheTime` → `gcTime`
  - `onSuccess/onError` en hooks → callbacks en mutate()
- **Import paths** — Cambiados imports de `@/lib` a rutas relativas correctas
- **Button component** — Prop `asChild` eliminado, cambiado a extensión de HTMLButtonElement
- **Event handlers** — Tipos corregidos de `MouseEvent` a `React.MouseEvent`

### 📄 Documentation
- `AI.md` — Manual de operación para agentes AI
- `ROADMAP.md` — Roadmap con milestones y priorización ABCD
- `ARCHITECTURE.md` — Arquitectura del sistema con diagramas
- `API_CONTRACTS.md` — Contratos de API (~95 endpoints)
- `DATA_MODEL.md` — Modelo de datos Prisma
- `SECURITY.md` — Baseline de seguridad
- `DESIGN_SYSTEM.md` — Sistema de diseño y componentes
- `ENVIRONMENT.md` — Variables de entorno
- `QA_CHECKLIST.md` — Checklist pre-lanzamiento
- `RELEASE_PROCESS.md` — Proceso de deployment
- `DECISIONS.md` — Log de decisiones arquitectónicas

### 📋 Tickets Created
- `0001-MVP-Foundation.md` — Base del proyecto
- `0002-Auth-MultiTenant-RBAC.md` — Autenticación y roles
- `0003-Booking-Core.md` — Sistema de reservaciones
- `0004-Stripe-Webhooks.md` — Integración de pagos
- `0005-Credits-Ledger.md` — Paquetes y créditos
- `0006-Resend-Emails.md` — Sistema de emails
- `0007-Dashboards-KPIs.md` — Dashboard y métricas

---

## [0.8.0] - 2026-01-15

### Added
- Stripe Checkout integration
- MercadoPago integration
- Cash/POS payment support
- Package consumption system

### Changed
- Payment flow refactored for multi-gateway support

---

## [0.7.0] - 2026-01-10

### Added
- Dashboard con KPIs
- Timeline de reservaciones
- Gráficos de ingresos

---

## [0.6.0] - 2026-01-05

### Added
- Sistema de paquetes prepagados
- Ledger de sesiones
- Expiración automática

---

## [0.5.0] - 2025-12-28

### Added
- Resend email integration
- Templates de confirmación
- Recordatorios automáticos

---

## [0.4.0] - 2025-12-20

### Added
- Sistema de reservaciones
- Cálculo de disponibilidad
- Prevención de colisiones

---

## [0.3.0] - 2025-12-15

### Added
- Catálogo de servicios
- Categorías
- Gestión de terapeutas

---

## [0.2.0] - 2025-12-10

### Added
- Autenticación JWT
- 2FA por email
- RBAC con 5 roles
- Multi-tenancy con clinicId

---

## [0.1.0] - 2025-12-01

### Added
- Monorepo setup (apps/api, apps/web)
- Prisma schema inicial
- Docker Compose para desarrollo
- Next.js 16 frontend
- Fastify 4 backend

---

[Unreleased]: https://github.com/org/eventora/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/org/eventora/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/org/eventora/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/org/eventora/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/org/eventora/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/org/eventora/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/org/eventora/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/org/eventora/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/org/eventora/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/org/eventora/releases/tag/v0.1.0
