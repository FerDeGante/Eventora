# 🚀 EVENTORA - Roadmap de Lanzamiento SaaS

**Última actualización:** 18 de diciembre de 2025  
**Estado:** Pre-lanzamiento  
**Objetivo:** Lanzar Eventora como SaaS para clínicas, estudios wellness y gimnasios

---

## 📊 MODELO DE NEGOCIO

### Target Market
Eventora está dirigido a:
- **Clínicas** de fisioterapia, rehabilitación, estética
- **Estudios wellness** (yoga, pilates, meditación)
- **Gimnasios** y centros deportivos
- **Spas** y centros de bienestar

### Propuesta de Valor
Un **Business OS all-in-one** que permite:

| Problema | Solución Eventora |
|----------|-------------------|
| Perder clientes por no contestar | Motor de reservas 24/7 autoservicio |
| Facturación inconsistente | Membresías + paquetes + productos |
| Cobros manuales y errores | Pagos online (Stripe/MP) + POS físico |
| No saber quién está por vencer | CRM segmentado + alertas automáticas |
| Citas perdidas | Recordatorios multicanal (email/SMS/WhatsApp) |
| Descontrol de inventario | Módulo de productos + stock |
| Sin reportes claros | Dashboard de ventas y métricas |

### Modelo de Revenue

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE STREAMS                               │
├─────────────────────────────────────────────────────────────────┤
│  1. SUSCRIPCIÓN MENSUAL (MRR)                                   │
│     • Starter: $299/mes (1 sucursal)                            │
│     • Growth: $599/mes (5 sucursales)                           │
│     • Enterprise: Custom                                         │
├─────────────────────────────────────────────────────────────────┤
│  2. COMISIÓN POR TRANSACCIÓN (Stripe Connect)                   │
│     • 2-3% de cada pago procesado                               │
│     • Aplica a membresías, paquetes y productos                 │
├─────────────────────────────────────────────────────────────────┤
│  3. ADD-ONS (Futuro)                                            │
│     • WhatsApp Business API                                      │
│     • Marketplace premium listing                                │
│     • White label                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Arquitectura de Pagos (Stripe Connect)

```
Cliente final paga $1,000 MXN
         ↓
┌─────────────────────────────────────────┐
│         STRIPE CONNECT                   │
│  Platform Account: Eventora              │
│  Connected Account: Workspace del cliente│
└─────────────────────────────────────────┘
         ↓
SPLIT AUTOMÁTICO:
  • $970 → Cuenta bancaria del Workspace (97%)
  • $30 → Cuenta Eventora (3% comisión)
  • Stripe cobra su fee (~3.6%)
```

**Ventajas:**
- ✅ Cada workspace recibe dinero directo en SU cuenta
- ✅ Eventora cobra comisión automática
- ✅ Sin riesgo legal de manejar dinero ajeno
- ✅ Reportes separados por workspace

---

## 🏗️ ARQUITECTURA TÉCNICA

### Nomenclatura
- **Workspace** = Cada clínica/estudio/gimnasio (antes "Clinic")
- **Super Admin** = Tú (dueño de Eventora)
- **Admin** = Dueño del workspace
- **Staff** = Empleados (recepción, terapeutas)
- **Client** = Cliente final del workspace

### Stack Tecnológico
```
Frontend:     Next.js 16 + React 19 + TypeScript
Backend:      Fastify + Prisma + PostgreSQL (Supabase)
Pagos:        Stripe Connect + MercadoPago
Email:        Resend
Auth:         JWT + 2FA
Hosting:      Vercel (web) + Railway (api)
```

### Módulos del Sistema

| Módulo | Backend | Frontend | Estado |
|--------|---------|----------|--------|
| **Auth** | ✅ 8 endpoints | ✅ Login/Register | 100% |
| **Workspaces** | ⚠️ 3 endpoints | ❌ No UI | 40% |
| **Branches** | ✅ Model | ❌ No CRUD ni UI | 20% |
| **Users/Staff** | ✅ CRUD | ✅ TherapistsSection | 80% |
| **Services** | ✅ CRUD | ✅ Catálogo | 90% |
| **Packages** | ✅ CRUD | ✅ Catálogo | 90% |
| **Memberships** | ❌ No existe | ❌ No existe | 0% |
| **Products/Inventory** | ❌ No existe | ❌ No existe | 0% |
| **Reservations** | ✅ CRUD | ✅ Wizard + Calendar | 90% |
| **Payments** | ✅ CRUD | ✅ Checkout | 80% |
| **POS** | ✅ Completo | ✅ Página POS | 100% |
| **Notifications** | ✅ CRUD | ⚠️ Solo config | 70% |
| **Check-in** | ✅ Model | ❌ No UI | 20% |
| **Dashboard** | ✅ Stats | ✅ KPIs | 80% |
| **CRM Segmentado** | ❌ No existe | ❌ No existe | 0% |
| **Reports** | ⚠️ Básico | ⚠️ Básico | 50% |
| **Super Admin** | ❌ No existe | ❌ No existe | 0% |
| **Onboarding** | ❌ No existe | ❌ No existe | 0% |
| **Settings** | ❌ No existe | ❌ No existe | 0% |

---

## 📋 TAREAS ABCD (Brian Tracy)

### 🔴 TAREAS A - CRÍTICAS (Sin esto NO hay lanzamiento)

| ID | Tarea | Horas | Descripción | Entregable |
|----|-------|-------|-------------|------------|
| **A1** | Modelos Prisma faltantes | 4h | Product, Membership, Sale, Subscription, Plan | `schema.prisma` actualizado |
| **A2** | Onboarding Flow | 12h | `/signup` → elegir plan → Stripe Checkout → crear workspace | Flujo completo funcional |
| **A3** | Stripe Connect Integration | 8h | Onboarding de cuentas conectadas, splits automáticos | Pagos a cuentas de workspaces |
| **A4** | Super Admin Dashboard | 8h | Rol SUPER_ADMIN + `/super-admin` con métricas globales | Panel de control de Eventora |
| **A5** | Settings de Workspace | 6h | `/settings` con config, usuarios, integraciones | Página funcional |
| **A6** | Membresías Backend | 6h | CRUD + lógica de sesiones/periodo + Stripe Subscriptions | Endpoints completos |
| **A7** | Membresías Frontend | 6h | UI para crear/gestionar membresías + asignar a clientes | Páginas funcionales |

**Subtotal A: 50 horas** ⏰

### 🟠 TAREAS B - IMPORTANTES (Afectan UX/revenue)

| ID | Tarea | Horas | Descripción | Entregable |
|----|-------|-------|-------------|------------|
| **B1** | Inventario de Productos | 8h | Model + CRUD + UI para venta de productos físicos | Módulo completo |
| **B2** | CRM Segmentado | 6h | Vista de clientes: activos/por vencer/vencidos | Dashboard CRM |
| **B3** | Check-in UI | 4h | Pantalla de recepción + QR para auto check-in | Página `/checkin` |
| **B4** | Alertas de Vencimiento | 4h | Cron job + emails automáticos "Tu membresía vence en X días" | Scheduler funcionando |
| **B5** | CRUD Branches | 4h | Endpoints + UI para gestionar sucursales | Módulo completo |
| **B6** | Módulo de Ventas unificado | 6h | Sale + SaleItem para unificar productos/servicios/membresías | Reportes de ventas |
| **B7** | Webhook Idempotency | 2h | Evitar duplicados en webhooks de Stripe | Código seguro |

**Subtotal B: 34 horas** ⏰

### 🟡 TAREAS C - DESEABLES (Mejoran producto)

| ID | Tarea | Horas | Descripción | Entregable |
|----|-------|-------|-------------|------------|
| **C1** | Reportes avanzados | 6h | Comparativos, gráficas, export CSV/PDF | Dashboard reportes |
| **C2** | Onboarding Wizard post-registro | 4h | Guía paso a paso para configurar workspace | Wizard UX |
| **C3** | Dashboard Super Admin avanzado | 6h | MRR, ARR, churn, gráficas de crecimiento | Analytics |
| **C4** | Audit Log UI | 3h | Página para ver logs de auditoría | Página `/audit` |
| **C5** | Multi-idioma | 8h | i18n en frontend (español/inglés) | Selector de idioma |
| **C6** | Email templates editables UI | 4h | Editor visual de plantillas de notificación | UI completa |

**Subtotal C: 31 horas** ⏰

### 🟢 TAREAS D - DELEGABLES (Post-lanzamiento)

| ID | Tarea | Horas | Descripción |
|----|-------|-------|-------------|
| **D1** | App móvil (React Native) | 40h | Booking + notificaciones push |
| **D2** | White label | 20h | Dominio custom + branding por workspace |
| **D3** | Marketplace público | 16h | Directorio de workspaces con booking |
| **D4** | BI/Analytics avanzado | 12h | Reportes exportables, dashboards custom |
| **D5** | Integración con Google Calendar | 8h | Sync bidireccional de citas |
| **D6** | API pública documentada | 12h | Para integraciones de terceros |

**Subtotal D: 108 horas** ⏰

---

## 📅 PLAN DE EJECUCIÓN

### Semana 1: Fundamentos (A1-A4)
```
Día 1-2: A1 - Modelos Prisma (Product, Membership, Sale, Subscription)
Día 3-4: A2 - Onboarding Flow (signup → checkout → workspace)
Día 5-6: A3 - Stripe Connect básico
Día 7:   A4 - Super Admin Dashboard básico
```

### Semana 2: Core Features (A5-A7 + B1-B3)
```
Día 1-2: A5 - Settings de Workspace
Día 3-4: A6 - Membresías Backend
Día 5-6: A7 - Membresías Frontend
Día 7:   B1-B3 - Inventario + CRM + Check-in
```

### Semana 3: Polish + Soft Launch
```
Día 1-2: B4-B7 - Alertas, Branches, Ventas, Idempotency
Día 3-4: Testing end-to-end
Día 5:   Deploy a producción
Día 6-7: Soft launch con 5-10 workspaces beta
```

---

## 🛠️ MODELOS PRISMA PENDIENTES

### 1. Membresías Flexibles (no solo mensuales)

```prisma
enum MembershipType {
  UNLIMITED         // Acceso ilimitado
  SESSIONS_TOTAL    // X sesiones totales (como paquete)
  SESSIONS_PERIOD   // X sesiones por periodo (5/semana, 20/mes)
  TIME_BASED        // Acceso por tiempo sin límite de sesiones
}

enum BillingCycle {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  BIANNUAL
  YEARLY
  ONE_TIME          // Pago único
  CUSTOM
}

model Membership {
  id                  String          @id @default(cuid())
  clinicId            String
  clinic              Clinic          @relation(...)
  
  name                String
  description         String?
  type                MembershipType
  
  // Límites de uso
  sessionsPerPeriod   Int?            // 5 (sesiones) - null si ilimitado
  periodType          String?         // "WEEK" | "MONTH" | null
  totalSessions       Int?            // Para SESSIONS_TOTAL
  validityDays        Int?            // Para TIME_BASED
  
  // Precios
  price               Int
  billingCycle        BillingCycle
  customCycleDays     Int?
  setupFee            Int             @default(0)
  
  // Restricciones
  allowedServices     String[]        // vacío = todos
  allowedBranches     String[]        // vacío = todas
  
  isActive            Boolean         @default(true)
  stripePriceId       String?
  features            Json?
  
  userMemberships     UserMembership[]
}

model UserMembership {
  id                      String     @id @default(cuid())
  clinicId                String
  userId                  String
  membershipId            String
  
  status                  String     // ACTIVE | PAUSED | CANCELLED | PAST_DUE | EXPIRED
  stripeSubscriptionId    String?
  
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  sessionsUsedThisPeriod  Int        @default(0)
  lastResetAt             DateTime?
  
  cancelAtPeriodEnd       Boolean    @default(false)
  pausedAt                DateTime?
  
  checkIns                MembershipCheckIn[]
}
```

### 2. Productos e Inventario

```prisma
model Product {
  id          String   @id @default(cuid())
  clinicId    String
  categoryId  String?
  name        String
  description String?
  sku         String?
  price       Int      @default(0)
  cost        Int      @default(0)
  stock       Int      @default(0)
  minStock    Int      @default(5)
  isActive    Boolean  @default(true)
  imageUrl    String?
  
  stockMovements StockMovement[]
  saleItems      SaleItem[]
}

model StockMovement {
  id        String   @id @default(cuid())
  productId String
  type      String   // IN | OUT | ADJUSTMENT | SALE
  quantity  Int
  note      String?
  createdAt DateTime @default(now())
  createdBy String?
}
```

### 3. Ventas Unificadas

```prisma
model Sale {
  id           String     @id @default(cuid())
  clinicId     String
  branchId     String?
  userId       String?
  staffId      String?
  subtotal     Int
  discount     Int        @default(0)
  tax          Int        @default(0)
  total        Int
  paymentMethod String
  status       String
  items        SaleItem[]
  createdAt    DateTime   @default(now())
}

model SaleItem {
  id          String   @id @default(cuid())
  saleId      String
  itemType    String   // PRODUCT | SERVICE | PACKAGE | MEMBERSHIP
  itemId      String
  name        String
  quantity    Int      @default(1)
  unitPrice   Int
  total       Int
}
```

### 4. Planes de Eventora (para TUS clientes)

```prisma
model Plan {
  id              String   @id @default(cuid())
  name            String   // Starter, Growth, Enterprise
  slug            String   @unique
  price           Int
  billingCycle    String   // MONTHLY | YEARLY
  stripePriceId   String?
  
  // Límites
  maxBranches     Int      @default(1)
  maxUsers        Int      @default(5)
  maxReservations Int?     // null = ilimitado
  
  // Features
  features        Json?
  isActive        Boolean  @default(true)
  
  subscriptions   Subscription[]
}

model Subscription {
  id                    String   @id @default(cuid())
  clinicId              String   @unique
  clinic                Clinic   @relation(...)
  planId                String
  plan                  Plan     @relation(...)
  
  status                String   // TRIALING | ACTIVE | PAST_DUE | CANCELLED
  stripeSubscriptionId  String?
  stripeCustomerId      String?
  
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  trialEndsAt           DateTime?
  cancelAtPeriodEnd     Boolean  @default(false)
}
```

---

## 🔐 CREDENCIALES DE DESARROLLO

| Usuario | Email | Password | Role |
|---------|-------|----------|------|
| Super Admin | ferdegante.22@gmail.com | eventoraadmin25 | SUPER_ADMIN |
| Admin Workspace | admin@workspace.com | admin123 | ADMIN |
| Terapeuta | terapeuta@workspace.com | therapist123 | THERAPIST |
| Cliente | cliente@ejemplo.com | cliente123 | CLIENT |

---

## 📋 COMANDOS ÚTILES

```bash
# Desarrollo
cd apps/api && npm run dev     # API en :4000
cd apps/web && npm run dev     # Web en :3000

# Base de datos
npx prisma migrate dev --name nombre
npx prisma generate
npx prisma db seed
npx prisma studio

# Testing
npm test                       # Unit tests
npm run test:e2e              # E2E tests
```

---

## ✅ CHECKLIST DE LANZAMIENTO

### Pre-lanzamiento
- [ ] Modelos Prisma completos (A1)
- [ ] Onboarding flow funcional (A2)
- [ ] Stripe Connect integrado (A3)
- [ ] Super Admin Dashboard (A4)
- [ ] Settings de Workspace (A5)
- [ ] Membresías completas (A6, A7)
- [ ] Dominio registrado
- [ ] Proyecto en Vercel
- [ ] Proyecto en Railway
- [ ] Variables de entorno producción
- [ ] Stripe en modo live
- [ ] DNS configurado

### Lanzamiento Soft
- [ ] 5-10 workspaces beta
- [ ] Feedback recopilado
- [ ] Bugs críticos resueltos

### Lanzamiento Público
- [ ] Landing page optimizada
- [ ] Documentación de usuario
- [ ] Soporte configurado
- [ ] Marketing activo
