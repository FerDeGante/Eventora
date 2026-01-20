# 🚀 EVENTORA - ROADMAP LANZAMIENTO 7 DÍAS

**Modelo de Negocio:** B2B SaaS para gimnasios, estudios wellness y clínicas
**Ingresos:** Suscripción mensual + 3% por transacción (Stripe Connect)

---

## 📅 CALENDARIO SEMANAL

| Día | Foco Principal | Entregables |
|-----|----------------|-------------|
| D1 (Hoy) | Backend SaaS Core | Prisma models ✅, Stripe Connect, Webhooks |
| D2 | Onboarding Flow | Signup, Checkout, Crear Workspace |
| D3 | Dashboard Workspace | Métricas, Servicios CRUD |
| D4 | Membresías | Backend + UI completo |
| D5 | Widget Booking | Embebible para websites de clientes |
| D6 | Pulir + Testing | Emails, Calendario, Fixes |
| D7 | Deploy + Lanzar | Producción, Primer cliente |

---

## ✅ COMPLETADO HOY (D1)

### Prisma Schema
- [x] `Plan` - Planes de Eventora (Starter, Professional, Enterprise)
- [x] `Subscription` - Suscripción del workspace a un plan
- [x] `Membership` - Membresías flexibles (ilimitada, sesiones/periodo, etc.)
- [x] `UserMembership` - Membresías vendidas a clientes finales
- [x] `MembershipCheckIn` - Registro de check-ins
- [x] `ProductCategory`, `Product`, `StockMovement` - Inventario
- [x] `Sale`, `SaleItem` - Ventas unificadas (POS)
- [x] Campos Stripe Connect en `Clinic` (stripeAccountId, chargesEnabled, etc.)

### Módulos Backend Creados
- [x] `/api/v1/memberships` - CRUD membresías + subscriptions + check-in
- [x] `/api/v1/connect` - Stripe Connect onboarding + payments
- [x] `/api/v1/products` - Productos, categorías, stock, ventas
- [x] `/api/v1/onboarding` - Signup + checkout flow

### Webhooks Actualizados
- [x] `checkout.session.completed` - SaaS + workspace payments
- [x] `customer.subscription.updated/deleted` - SaaS billing
- [x] `account.updated` - Stripe Connect
- [x] `payment_intent.succeeded` - Connect payments
- [x] `invoice.payment_failed` - Pagos fallidos

---

## 📋 TAREAS ABCDE - PENDIENTES

### 🔴 A - CRÍTICAS (Sin esto NO hay lanzamiento) - ✅ COMPLETADO

#### A1: Landing Page con Pricing (4h) - D2 ✅
```
/apps/web/src/app/(marketing)/page.tsx
/apps/web/src/app/(marketing)/pricing/page.tsx
```
- [x] Hero section con propuesta de valor
- [x] Features grid (reservas, pagos, membresías, reportes)
- [x] Tabla de precios (3 planes)
- [x] CTA "Comenzar 14 días gratis"
- [x] Footer con links legales

#### A2: Signup + Checkout Flow (6h) - D2 ✅
```
/apps/web/src/app/(auth)/signup/page.tsx
/apps/web/src/components/onboarding/SignupWizard.tsx
```
- [x] Formulario: nombre, email, password, nombre workspace
- [x] Validación de slug disponible
- [x] Selección de plan
- [x] Redirect a Stripe Checkout
- [x] Página success/cancelled

#### A3: Onboarding Success (3h) - D2 ✅
```
/apps/web/src/app/onboarding/success/page.tsx
```
- [x] Verificar sesión de Stripe
- [x] Crear JWT y autenticar
- [x] Redirect a dashboard con tutorial

#### A4: Dashboard Principal (6h) - D3 ✅
```
/apps/web/src/app/(app)/page.tsx
```
- [x] Layout con sidebar
- [x] Tarjetas de métricas (ingresos, reservas, clientes)
- [x] Gráfica de reservas/ingresos últimos 30 días
- [x] Lista de próximas citas
- [x] Acciones rápidas

#### A5: CRUD Servicios (UI) (4h) - D3 ✅
```
/apps/web/src/app/(app)/services/page.tsx
```
- [x] Tabla de servicios con búsqueda y filtros
- [x] Modal crear/editar servicio
- [x] Categorías de servicios con CRUD completo
- [x] Configurar duración y precio

#### A6: CRUD Membresías (UI) (4h) - D4 ✅
```
/apps/web/src/app/(app)/memberships/page.tsx
```
- [x] Lista de planes de membresía (cards)
- [x] Formulario con tipos: ilimitada, sesiones totales, sesiones/periodo, tiempo
- [x] Configurar precio, ciclo de cobro, restricciones
- [x] Tabs All/Public/Private

#### A7: Vender Membresía a Cliente (4h) - D4 ✅
```
/apps/web/src/app/(app)/memberships/subscriptions/page.tsx
```
- [x] Ver subscripciones de clientes
- [x] Asignar membresía desde modal
- [x] Ver membresías activas con stats
- [x] Pausar/Reanudar/Cancelar

#### A8: Stripe Connect Onboarding (UI) (3h) - D4 ✅
```
/apps/web/src/app/(app)/settings/payments/page.tsx
```
- [x] Estado de conexión con Stripe
- [x] Botón "Conectar Stripe"
- [x] Mostrar si puede recibir pagos
- [x] Link al dashboard de Stripe

#### A9: Widget de Booking (6h) - D5 ✅
```
/apps/web/src/app/book/[slug]/page.tsx
```
- [x] Diseño responsive standalone
- [x] Seleccionar servicio
- [x] Calendario con fechas y horarios disponibles
- [x] Formulario cliente (nombre, email, teléfono, notas)
- [x] Redirección a checkout si requiere pago
- [x] Confirmación

#### A10: Checkout del Cliente Final (4h) - D5 ✅
```
/apps/web/src/app/book/[slug]/checkout/page.tsx
/apps/api/src/modules/marketplace/public-booking.service.ts
```
- [x] Crear checkout session con Stripe Connect
- [x] Split automático de comisión (3%)
- [x] Página de checkout con detalles de reservación
- [x] Webhook para confirmar pago y actualizar reservación
- [x] Estados: pagado, cancelado, pendiente

**Total A: 44 horas - ✅ COMPLETADO**

---

### 🟡 B - IMPORTANTES (Mejoran experiencia, pueden esperar post-launch)

#### 📁 Frontend - Track B (Post-MVP Enhancements)
**Tickets creados:** [FRONT-B1 a FRONT-B8](#tickets-frontend-track-b)

#### FRONT-B1: Admin Reservations Management (6h) - Sprint 2 🔴
```
/apps/web/src/app/(app)/admin/reservations-management/page.tsx
```
- [ ] Replace mock data with real API calls
- [ ] Connect filters to backend query params (date, status, therapist)
- [ ] Add pagination support
- [ ] Test with real reservation data
**Status:** Page exists but entirely mock data

#### FRONT-B2: Dashboard-Improved Charts (4h) - Sprint 2 🟡
```
/apps/web/src/app/(app)/dashboard-improved/page.tsx
```
- [ ] Connect ReservationsChart to analytics API
- [ ] Connect RevenueChart to analytics API
- [ ] Enable date range filtering with real data
- [ ] Add loading states
**Status:** Charts exist but use mock data

#### FRONT-B3: Stripe Connect Onboarding Flow (5h) - Sprint 2 🔴
```
/apps/web/src/app/(app)/settings/payments/page.tsx
```
- [ ] Show comprehensive account status (charges/payouts enabled)
- [ ] Add webhook health monitoring dashboard
- [ ] Implement error recovery flows
- [ ] Test full onboarding with Stripe test account
**Status:** Basic UI exists, needs completion

#### FRONT-B4: Wizard Flow Completion (4h) - Sprint 2 🔴
```
/apps/web/src/app/(app)/wizard/page.tsx
```
- [ ] Fix TODO: Get userId from auth session (line 176)
- [ ] Improve fallback UX for no slots available
- [ ] Add "back" button between steps
- [ ] Test edge cases (service at capacity, API failures)
**Status:** Works but has TODO and missing edge cases

#### FRONT-B5: Reports Page Enhancement (6h) - Sprint 3 🟢
```
/apps/web/src/app/(app)/reports/page.tsx
```
- [ ] Add no-show rate metric
- [ ] Add therapist utilization metric
- [ ] Implement export to CSV
- [ ] Add print-friendly view
- [ ] Date range presets (This Week, This Month, etc.)
**Status:** Basic page exists, needs enhancements

#### FRONT-B6: Notification Templates Editor (8h) - Sprint 3 🟢
```
/apps/web/src/app/(app)/notifications/page.tsx
```
- [ ] Integrate rich text editor (TipTap/Quill)
- [ ] Add preview pane with sample data
- [ ] Create variable picker ({{clientName}}, etc.)
- [ ] Implement "Send Test Email" functionality
**Status:** Templates list exists, needs rich editor

#### FRONT-B7: Marketplace Enhancement (5h) - Sprint 3 🟢
```
/apps/web/src/app/(app)/marketplace/page.tsx
```
- [ ] Add location-based search
- [ ] Add service type and price filters
- [ ] Consider map view integration
- [ ] Add "Featured Clinics" section
**Status:** Basic marketplace exists with fallback data

#### FRONT-B8: Client Portal Enhancement (8h) - Sprint 3 🟢
```
/apps/web/src/app/(app)/client/*
```
- [ ] Create client dashboard route
- [ ] Show upcoming appointments
- [ ] Enable self-service cancel/reschedule
- [ ] Show credits balance
- [ ] Download appointment receipts
**Status:** CLIENT role exists but minimal UI

**Total Track B: 46 horas**

---

### 🟢 ORIGINAL B - NICE TO HAVE (Mantener como C)

#### B-Legacy-1: Emails Transaccionales (3h) - D6
- [ ] Template: Bienvenida workspace
- [ ] Template: Confirmación de reserva
- [ ] Template: Recordatorio de cita
- [ ] Template: Pago recibido

#### B-Legacy-2: Calendario Visual (4h) - D6
```
/apps/web/src/app/(dashboard)/calendar/page.tsx
```
- [ ] Vista mensual/semanal/diaria
- [ ] Arrastrar para crear cita
- [ ] Color por terapeuta/servicio

#### B-Legacy-3: Gestión de Clientes (3h) - D6
```
/apps/web/src/app/(dashboard)/clients/page.tsx
```
- [ ] Lista de clientes con búsqueda
- [ ] Filtrar por membresía activa
- [ ] Exportar CSV

#### B-Legacy-4: Reportes Básicos (4h) - D7
```
/apps/web/src/app/(dashboard)/reports/page.tsx
```
- [ ] Ingresos por periodo
- [ ] Reservas por servicio
- [ ] Tasa de ocupación
- [ ] Exportar PDF

#### B-Legacy-5: Settings del Workspace (3h) - D6
- [ ] Logo y colores
- [ ] Horarios de operación
- [ ] Timezone
- [ ] Notificaciones

#### B-Legacy-6: Check-in Manual (2h) - D7
- [ ] Botón check-in en reserva
- [ ] Escanear QR o buscar cliente
- [ ] Confirmar asistencia

**Total B-Legacy: 19 horas**

---

### 🟢 C - NICE TO HAVE (Backlog post-lanzamiento)

| ID | Tarea | Horas |
|----|-------|-------|
| C1 | PWA móvil | 8h |
| C2 | Google Calendar sync | 4h |
| C3 | Multi-sucursal | 6h |
| C4 | Inventario de productos | 4h |
| C5 | POS físico | 8h |
| C6 | WhatsApp notifications | 4h |
| C7 | Waitlist para clases llenas | 3h |
| C8 | Paquetes de sesiones | 4h |
| C9 | Gift cards | 4h |
| C10 | Referral program | 6h |

---

## 📊 SPRINT PLANNING - POST MVP

### Sprint 2 (Integraciones Críticas) - 19 horas
**Foco:** Completar funcionalidades existentes que usan mock data

| Ticket | Descripción | Horas | Prioridad |
|--------|-------------|-------|-----------|
| FRONT-B1 | Admin Reservations Backend Integration | 6h | 🔴 Alta |
| FRONT-B3 | Stripe Connect Onboarding Completion | 5h | 🔴 Alta |
| FRONT-B4 | Wizard Auth Integration Fix | 4h | 🔴 Alta |
| FRONT-B2 | Dashboard Charts Real Data | 4h | 🟡 Media |

**Dependencias:**
- Backend: Verificar endpoints `/api/v1/reservations` con filtros
- Backend: Analytics endpoints `/api/v1/analytics/*`
- Stripe: Webhook verification setup

### Sprint 3 (Mejoras UX) - 27 horas
**Foco:** Enhancements de experiencia de usuario

| Ticket | Descripción | Horas | Prioridad |
|--------|-------------|-------|-----------|
| FRONT-B6 | Notification Templates Rich Editor | 8h | 🟢 Media |
| FRONT-B8 | Client Self-Service Portal | 8h | 🟢 Media |
| FRONT-B5 | Reports Page Enhancement | 6h | 🟢 Baja |
| FRONT-B7 | Marketplace Search & Filters | 5h | 🟢 Baja |

**Dependencias:**
- Backend: Analytics metrics (no-show rate, utilization)
- Backend: Client-facing endpoints
- Considerar: Rich text editor library (TipTap vs Quill)

### Backlog (Nice to Have) - Movido a C

| ID | Tarea | Horas |
|----|-------|-------|
| C1 | PWA móvil | 8h |
| C2 | Google Calendar sync | 4h |
| C3 | Multi-sucursal | 6h |
| C4 | Inventario de productos | 4h |
| C5 | POS físico | 8h |
| C6 | WhatsApp notifications | 4h |
| C7 | Waitlist para clases llenas | 3h |
| C8 | Paquetes de sesiones | 4h |
| C9 | Gift cards | 4h |
| C10 | Referral program | 6h |

---

## 📋 TICKETS FRONTEND TRACK-B

**Location:** `/docs/tickets/FRONT-B*.md`

| Ticket | Title | Status | Files |
|--------|-------|--------|-------|
| [FRONT-B1](../docs/tickets/FRONT-B1.md) | Admin Reservations Management | TODO | admin/reservations-management/page.tsx |
| [FRONT-B2](../docs/tickets/FRONT-B2.md) | Dashboard-Improved Charts | TODO | dashboard-improved/page.tsx |
| [FRONT-B3](../docs/tickets/FRONT-B3.md) | Stripe Connect Onboarding | TODO | settings/payments/page.tsx |
| [FRONT-B4](../docs/tickets/FRONT-B4.md) | Wizard Flow Completion | TODO | wizard/page.tsx |
| [FRONT-B5](../docs/tickets/FRONT-B5.md) | Reports Page Enhancement | TODO | reports/page.tsx |
| [FRONT-B6](../docs/tickets/FRONT-B6.md) | Notification Templates Editor | TODO | notifications/page.tsx |
| [FRONT-B7](../docs/tickets/FRONT-B7.md) | Marketplace Enhancement | TODO | marketplace/page.tsx |
| [FRONT-B8](../docs/tickets/FRONT-B8.md) | Client Portal Enhancement | TODO | client/* (new routes) |

**Audit Findings Summary:**
- ⚠️ 3 pages with complete mock data (admin/reservations, dashboard-improved, waitlist)
- ⚠️ 1 TODO for auth session integration (wizard)
- ⚠️ 2 pages needing enhancement (reports, notifications)
- ⚠️ 2 areas for UX improvement (marketplace, client portal)
- ✅ 5 pages production-ready (dashboard, day-sheet, services, wallet mock structure, checkout)

---

### 🔵 D - DELEGAR (Si tuvieras equipo)

- Diseño gráfico de landing y assets
- Copywriting (textos de venta)
- Video demo del producto
- SEO y contenido de blog
- Soporte al cliente inicial

---

### ⚫ E - ELIMINAR (No hacer esta semana)

- Super Admin Dashboard (usa Prisma Studio)
- Analytics avanzados (usa Stripe Dashboard)
- API pública con documentación
- Integraciones con terceros
- App nativa iOS/Android
- Multi-idioma

---

## 🎯 ENDPOINTS COMPLETADOS

### Onboarding (Público)
```
GET  /api/v1/onboarding/plans         # Listar planes
POST /api/v1/onboarding/check-slug    # Verificar disponibilidad
POST /api/v1/onboarding/generate-slug # Generar slug de nombre
POST /api/v1/onboarding/signup        # Crear workspace + checkout
```

### Membresías (Autenticado)
```
GET    /api/v1/memberships              # Listar membresías
POST   /api/v1/memberships              # Crear membresía
GET    /api/v1/memberships/:id          # Obtener membresía
PATCH  /api/v1/memberships/:id          # Actualizar
DELETE /api/v1/memberships/:id          # Eliminar

GET    /api/v1/memberships/subscriptions           # Listar suscripciones
POST   /api/v1/memberships/subscriptions           # Vender membresía
GET    /api/v1/memberships/subscriptions/:id       # Obtener suscripción
PATCH  /api/v1/memberships/subscriptions/:id       # Actualizar
POST   /api/v1/memberships/subscriptions/:id/cancel # Cancelar

POST   /api/v1/memberships/check-in              # Hacer check-in
POST   /api/v1/memberships/check-in/:id/checkout # Hacer check-out
GET    /api/v1/memberships/subscriptions/:id/check-ins # Historial
```

### Stripe Connect (Autenticado)
```
GET  /api/v1/connect/status         # Estado de conexión
POST /api/v1/connect/onboarding     # Iniciar onboarding
POST /api/v1/connect/dashboard-link # Link a Stripe Express
POST /api/v1/connect/payment-intent # Crear pago con split
POST /api/v1/connect/checkout       # Crear checkout con split
```

### Productos (Autenticado)
```
GET    /api/v1/products                  # Listar productos
POST   /api/v1/products                  # Crear producto
GET    /api/v1/products/:id              # Obtener producto
PATCH  /api/v1/products/:id              # Actualizar
DELETE /api/v1/products/:id              # Eliminar

GET    /api/v1/products/categories       # Listar categorías
POST   /api/v1/products/categories       # Crear categoría

GET    /api/v1/products/stock-movements  # Historial de stock
POST   /api/v1/products/stock-movements  # Registrar movimiento

GET    /api/v1/products/sales            # Listar ventas
POST   /api/v1/products/sales            # Crear venta
GET    /api/v1/products/sales/:id        # Obtener venta
POST   /api/v1/products/sales/:id/complete # Completar venta
POST   /api/v1/products/sales/:id/refund   # Reembolsar
POST   /api/v1/products/sales/:id/cancel   # Cancelar
```

---

## 🏃 PRÓXIMOS PASOS INMEDIATOS

1. **Ahora:** Verificar que el API compile y responda
2. **Siguiente:** Crear componentes de UI para landing y signup
3. **Hoy terminar:** Landing page básica funcionando

---

## 💰 MODELO DE PRICING DEFINIDO

| Plan | Precio/mes | Usuarios | Sucursales | Fee |
|------|-----------|----------|------------|-----|
| Starter | $599 MXN | 3 | 1 | 4% |
| Professional | $1,299 MXN | 10 | 3 | 3% |
| Enterprise | $2,999 MXN | 50 | 10 | 2% |

**Trial:** 14 días gratis en cualquier plan

---

## 🔥 RETO DEL DÍA

**Antes de terminar hoy:**
1. Levantar el API y verificar que `/api/v1/onboarding/plans` responda
2. Crear los planes en la BD con el seeder
3. Probar el endpoint de signup (sin UI, con curl/Insomnia)

**Comando para probar:**
```bash
# En una terminal
cd apps/api && npm run dev

# En otra terminal
curl http://localhost:4000/api/v1/onboarding/plans
```

---

*Última actualización: 18 de diciembre de 2025*
