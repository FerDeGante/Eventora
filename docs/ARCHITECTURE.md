# Architecture — Eventora

> **Tipo:** SaaS Multi-tenant B2B  
> **Dominio:** Wellness, Clínicas, Spas, Estudios  
> **Última actualización:** 19 enero 2026

---

## Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Browser │  │ Mobile  │  │  POS    │  │ Webhook │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE / CDN (Netlify)                        │
│  - Static assets                                                 │
│  - Next.js SSR                                                  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 16)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  (app)      │  │  (auth)     │  │  (public)   │             │
│  │  Dashboard  │  │  Login      │  │  Landing    │             │
│  │  Wizard     │  │  Register   │  │  Booking    │             │
│  │  POS        │  │  Reset      │  │  Widget     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
        │
        │ REST API (fetch)
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Fastify 4.29)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PLUGINS                               │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │   │
│  │  │  JWT   │ │ CORS   │ │Helmet  │ │Rate    │           │   │
│  │  │  Auth  │ │        │ │        │ │Limit   │           │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MODULES                               │   │
│  │  auth │ users │ clinics │ catalog │ availability        │   │
│  │  reservations │ payments │ memberships │ notifications   │   │
│  │  dashboard │ pos │ connect │ onboarding │ products       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │
        │ Prisma ORM
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (Supabase)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 PostgreSQL 15                            │   │
│  │  34 modelos │ 17 enums │ Multi-tenant (clinicId)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │
        │ External Services
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRACIONES                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Stripe  │ │Mercado │ │Resend  │ │Upstash │ │Sentry  │       │
│  │        │ │Pago    │ │Email   │ │Redis   │ │Monitor │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Carpetas

```
eventora/
├── apps/
│   ├── api/                    # Backend Fastify
│   │   ├── src/
│   │   │   ├── lib/           # Utilidades (prisma, stripe, etc.)
│   │   │   ├── modules/       # Módulos de negocio
│   │   │   ├── plugins/       # Plugins Fastify
│   │   │   ├── routes/        # Rutas (webhooks)
│   │   │   └── main.ts        # Entry point
│   │   └── test/              # Tests
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # Componentes React
│       │   ├── hooks/         # Custom hooks
│       │   ├── lib/           # API clients, utils
│       │   └── styles/        # CSS global
│       └── public/            # Assets estáticos
│
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── migrations/            # Migraciones SQL
│   └── seed.ts                # Datos iniciales
│
├── docs/                       # Documentación
│   ├── AI.md                  # Manual para AI
│   ├── ROADMAP.md             # Estado y prioridades
│   ├── SECURITY.md            # Baseline de seguridad
│   ├── ARCHITECTURE.md        # Este archivo
│   ├── DESIGN_SYSTEM.md       # Tokens y componentes
│   ├── DECISIONS.md           # Log de decisiones
│   ├── adr/                   # Architecture Decision Records
│   ├── tickets/               # Tickets de trabajo
│   └── ops/                   # Operaciones
│
├── scripts/                    # Scripts de utilidad
│   ├── db-reset.sh
│   ├── db-backup.sh
│   └── db-restore.sh
│
└── docker-compose.yml          # Desarrollo local
```

---

## Módulos Backend

| Módulo | Responsabilidad | Endpoints |
|--------|-----------------|-----------|
| `auth` | Autenticación, 2FA, JWT | 8 |
| `users` | CRUD usuarios, roles | 4 |
| `clinics` | Gestión de clínicas | 3 |
| `catalog` | Servicios, categorías, paquetes | 8 |
| `availability` | Templates, excepciones | 6 |
| `reservations` | Booking, estados, check-in | 6 |
| `payments` | Checkout, refunds | 5 |
| `memberships` | Planes, suscripciones, check-in | 10 |
| `notifications` | Templates, envío | 4 |
| `dashboard` | KPIs, overview | 2 |
| `pos` | Terminales, impresoras, turnos | 17 |
| `connect` | Stripe Connect | 4 |
| `onboarding` | Signup SaaS | 4 |
| `products` | Inventario, ventas | 12 |
| `calendar` | Export ICS, sync | 2 |

**Total: ~95 endpoints**

---

## Flujos Principales

### Booking (Cliente)
```
1. Cliente abre /wizard
2. Selecciona sucursal (GET /public/branches)
3. Selecciona servicio (GET /public/services)
4. Ve disponibilidad (GET /availability)
5. Selecciona slot
6. Checkout (POST /payments/checkout)
7. Redirect a Stripe
8. Webhook procesa pago
9. Reserva creada con estado CONFIRMED
10. Email de confirmación enviado
```

### Check-in (Recepción)
```
1. Reception abre /dashboard
2. Ve timeline del día
3. Cliente llega
4. Click "Check-in" (PATCH /reservations/:id/status)
5. Estado cambia a CHECKED_IN
6. Al terminar: COMPLETED
```

---

## Decisiones de Arquitectura

| Decisión | Razón |
|----------|-------|
| Fastify sobre Express | Performance, TypeScript nativo |
| Prisma sobre raw SQL | Type safety, migraciones |
| Next.js App Router | Server components, mejor DX |
| React Query | Cache, revalidación automática |
| Supabase | PostgreSQL managed, auth opcional |
| Upstash Redis | Rate limiting serverless |

---

## Referencias

- [SECURITY.md](SECURITY.md) — Detalles de seguridad
- [DATA_MODEL.md](DATA_MODEL.md) — Modelo de datos
- [API_CONTRACTS.md](API_CONTRACTS.md) — Contratos de API
- [/prisma/schema.prisma](/prisma/schema.prisma) — Schema completo

---

*Última actualización: 19 enero 2026*
