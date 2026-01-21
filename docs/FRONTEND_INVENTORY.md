# Frontend Inventory — Eventora

> **Última actualización:** 21 enero 2026  
> **Propósito:** Catálogo completo de todas las pantallas y funcionalidades del frontend

---

## 📱 ESTRUCTURA DE RUTAS

```
apps/web/src/app/
├── (app)/                          # Área autenticada (requiere login)
│   ├── dashboard/                  # Dashboard principal
│   ├── wizard/                     # Motor de reservaciones
│   ├── clients/                    # Gestión de clientes
│   ├── services/                   # Catálogo de servicios
│   ├── calendar/                   # Vista de calendario
│   ├── pos/                        # Punto de venta
│   ├── reports/                    # Reportes y analytics
│   ├── memberships/                # Gestión de membresías
│   │   └── subscriptions/          # Suscripciones de clientes
│   ├── wallet/                     # Wallet y créditos
│   ├── notifications/              # Plantillas de email
│   ├── settings/                   # Configuración
│   │   └── payments/               # Stripe Connect
│   ├── waitlist/                   # Lista de espera
│   ├── marketplace/                # Marketplace de clínicas
│   ├── admin/                      # Área admin
│   │   └── reservations-management/
│   └── client/                     # Portal cliente
│       ├── dashboard/              # Dashboard cliente
│       └── profile/                # Perfil cliente
│
├── (auth)/                         # Autenticación
│   ├── login/
│   ├── signup/
│   └── reset-password/
│
├── book/                           # Booking público (sin auth)
├── onboarding/                     # Post-signup wizard
│   ├── success/
│   └── cancelled/
└── page.tsx                        # Landing principal
```

---

## 🎯 PANTALLAS PRINCIPALES (Admin/Staff)

### **1. Dashboard Principal** `/dashboard`
**Funcionalidad:**
- KPIs del mes (ingresos, reservas, clientes nuevos)
- Timeline del día con citas próximas
- Acciones rápidas (nueva reserva, check-in, POS)
- Gráfica de ingresos últimos 30 días

**Componentes clave:**
- `<SectionHeading />` - Header con título
- `<GlowCard />` - Tarjetas con efecto glow
- `<EventoraButton />` - Botones branded
- `<Charts />` - Gráficas con Recharts

**APIs usadas:**
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/reservations?status=CONFIRMED&date=today`

**Estado:** ✅ Funcional

---

### **2. Motor de Reservaciones (Wizard)** `/wizard`
**Funcionalidad:**
- Paso 1: Seleccionar sucursal
- Paso 2: Seleccionar servicio/categoría
- Paso 3: Elegir fecha y ver disponibilidad
- Paso 4: Seleccionar slot horario
- Paso 5: Datos del cliente (nombre, email, teléfono)
- Paso 6: Checkout con Stripe o efectivo

**Flujo técnico:**
```typescript
// 1. Fetch branches
GET /api/v1/public/branches?clinicId=xxx

// 2. Fetch services
GET /api/v1/public/services?branchId=xxx

// 3. Check availability
GET /api/v1/availability?serviceId=xxx&date=2026-01-21

// 4. Create checkout
POST /api/v1/payments/checkout
{
  serviceId, slotTime, userId, paymentMethod
}

// 5. Redirect to Stripe (si es tarjeta)
// 6. Webhook crea la reservación
```

**Características:**
- ✅ Integración con Stripe Checkout
- ✅ Opción de pago en efectivo
- ✅ Validación de slots disponibles
- ✅ Estados de carga y error
- ⚠️ userId hardcodeado → **ARREGLADO en FRONT-B4** (usa JWT)

**APIs usadas:**
- `GET /api/v1/public/branches`
- `GET /api/v1/public/services`
- `GET /api/v1/availability`
- `POST /api/v1/payments/checkout`

**Estado:** ✅ Funcional (requiere auth fix)

---

### **3. Gestión de Clientes** `/clients`
**Funcionalidad:**
- Lista de todos los clientes
- Búsqueda por nombre/email/teléfono
- Filtros (activos, con membresía, etc.)
- Ver historial de reservas por cliente
- Crear/editar cliente
- Ver créditos y membresías activas

**Tabla incluye:**
- Nombre, email, teléfono
- Fecha de registro
- Última visita
- Total gastado
- Estado de membresía

**APIs usadas:**
- `GET /api/v1/users?role=CLIENT`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`

**Estado:** ✅ Funcional

---

### **4. Catálogo de Servicios** `/services`
**Funcionalidad:**
- CRUD completo de servicios
- Categorías de servicios (CLASS vs SESSION)
- Configuración de:
  - Nombre, descripción
  - Duración (15-240 min)
  - Precio
  - Capacidad (para clases grupales)
  - Recursos requeridos
  - Disponibilidad

**Includes:**
- Modal de creación/edición
- Búsqueda y filtros
- Activar/desactivar servicios
- Gestión de categorías

**APIs usadas:**
- `GET /api/v1/services`
- `POST /api/v1/services`
- `PATCH /api/v1/services/:id`
- `DELETE /api/v1/services/:id`
- `GET /api/v1/service-categories`

**Estado:** ✅ Funcional

---

### **5. Calendario** `/calendar`
**Funcionalidad:**
- Vista mensual de todas las reservas
- Click en día para ver detalle
- Filtros por:
  - Terapeuta/staff
  - Servicio
  - Estado (confirmadas, canceladas, etc.)
- Crear reserva desde calendario
- Drag & drop para mover citas (pendiente)

**Integraciones:**
- Export a Google Calendar (ICS file)
- Sync bidireccional (pendiente)

**APIs usadas:**
- `GET /api/v1/reservations?startDate=xxx&endDate=xxx`
- `GET /api/v1/calendar/export` (ICS)

**Estado:** ✅ Funcional básico

---

### **6. Punto de Venta (POS)** `/pos`
**Funcionalidad:**
- Buscar cliente o crear nuevo
- Carrito de compra:
  - Servicios
  - Productos de inventario
  - Membresías
  - Paquetes de créditos
- Métodos de pago:
  - Efectivo
  - Tarjeta (terminal físico)
  - Stripe (online)
- Imprimir ticket
- Gestión de turno de caja

**Includes:**
- Calculadora de cambio
- Descuentos y promociones
- Aplicar créditos/membresías
- Historial de ventas del turno
- Apertura/cierre de caja

**APIs usadas:**
- `POST /api/v1/pos/sales`
- `GET /api/v1/pos/terminals`
- `POST /api/v1/pos/shifts/open`
- `POST /api/v1/pos/shifts/close`

**Estado:** ✅ Funcional

---

### **7. Reportes y Analytics** `/reports`
**Funcionalidad:**
- Dashboard de métricas:
  - Ingresos totales
  - Reservas completadas
  - Tasa de cancelación
  - Ticket promedio
  - Ocupación por servicio
- Filtros de fecha:
  - Hoy, Semana, Mes, Trimestre, Año, Custom
- Top 5 servicios más vendidos
- Gráfica de ingresos diarios
- **Export a CSV** (FRONT-B5) ✅
- **Imprimir reporte** (FRONT-B5) ✅

**Gráficas:**
- Ingresos por día (line chart)
- Servicios por categoría (bar chart)
- Ocupación semanal (heatmap - pendiente)

**APIs usadas:**
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/top-services`

**Estado:** ✅ Funcional + Enhanced (B5)

---

### **8. Membresías** `/memberships`
**Funcionalidad:**
- CRUD de planes de membresía:
  - Ilimitada (unlimited visits)
  - Por sesiones totales (10 sesiones)
  - Por sesiones/periodo (4 clases/mes)
  - Por tiempo (30 días acceso)
- Configurar:
  - Nombre, descripción
  - Precio (one-time o recurrente)
  - Duración
  - Servicios incluidos
  - Límites de uso
- Ver suscripciones activas
- Check-in con membresía

**Suscripciones de clientes:**
`/memberships/subscriptions`
- Lista de todos los clientes con membresía activa
- Estado (activa, pausada, expirada)
- Check-ins restantes
- Renovaciones automáticas

**APIs usadas:**
- `GET /api/v1/memberships`
- `POST /api/v1/memberships`
- `GET /api/v1/memberships/user-memberships`
- `POST /api/v1/memberships/check-in`

**Estado:** ✅ Funcional

---

### **9. Wallet y Créditos** `/wallet`
**Funcionalidad:**
- Gestión de paquetes de créditos
- Crear paquetes:
  - 5 sesiones por $X
  - 10 sesiones con 10% descuento
  - 20 sesiones con 20% descuento
- Vender paquete a cliente
- Ver balance de créditos por cliente
- Consumo automático al reservar
- Historial de transacciones (ledger)

**Ledger incluye:**
- Compra de paquete (+10 créditos)
- Uso en reserva (-1 crédito)
- Expiración de créditos
- Transferencias entre clientes (opcional)

**APIs usadas:**
- `GET /api/v1/packages`
- `POST /api/v1/packages/purchase`
- `GET /api/v1/user-packages/:userId`

**Estado:** ✅ Funcional

---

### **10. Notificaciones** `/notifications`
**Funcionalidad:**
- Gestión de templates de email (Resend)
- Plantillas predefinidas:
  - Confirmación de reserva
  - Recordatorio 24h antes
  - Recordatorio 1h antes
  - Follow-up post-sesión
  - Password reset
  - 2FA codes
- **Rich text editor** (FRONT-B6) ✅
- **Variable picker** (FRONT-B6) ✅
- **Vista previa** (FRONT-B6) ✅
- **Envío de prueba** (FRONT-B6) ✅

**Variables disponibles:**
- {{clientName}}, {{clientEmail}}
- {{serviceName}}, {{therapistName}}
- {{appointmentDate}}, {{appointmentTime}}
- {{clinicName}}, {{clinicPhone}}
- {{confirmationLink}}, {{cancelLink}}

**APIs usadas:**
- `GET /api/v1/notifications/templates`
- `PATCH /api/v1/notifications/templates/:id`
- `POST /api/v1/notifications/templates/:id/test-send` (pendiente)

**Estado:** ✅ Funcional + Enhanced (B6)

---

### **11. Settings (Configuración)** `/settings`
**Funcionalidad:**
- Información de la clínica
- Branding (logo, colores)
- Horarios de operación
- Configuración de notificaciones
- Usuarios y roles (RBAC)
- Integraciones

**Payments Settings:** `/settings/payments`
- Stripe Connect onboarding
- Estado de cuenta Stripe:
  - Charges enabled
  - Payouts enabled
  - Balance disponible
- Métodos de pago aceptados
- Configuración de fees

**APIs usadas:**
- `GET /api/v1/clinics/current`
- `PATCH /api/v1/clinics/:id`
- `POST /api/v1/stripe/connect/onboarding`
- `GET /api/v1/stripe/connect/status`

**Estado:** ✅ Funcional (Stripe Connect parcial)

---

### **12. Lista de Espera** `/waitlist`
**Funcionalidad:**
- Clientes que esperan disponibilidad
- Notificar cuando se libere slot
- Gestión de prioridad
- Convertir waitlist → reservación

**APIs usadas:**
- `GET /api/v1/waitlist`
- `POST /api/v1/waitlist`

**Estado:** ⚠️ Básico (requiere mejoras)

---

### **13. Marketplace** `/marketplace`
**Funcionalidad:**
- Directorio público de clínicas
- Búsqueda por:
  - Nombre
  - Ubicación
  - Tipo de servicio
- **Featured clinics** (FRONT-B7) ✅
- **Filtros colapsables** (FRONT-B7) ✅
- **Service type filter** (FRONT-B7) ✅
- Link a página de booking

**APIs usadas:**
- `GET /api/v1/public/clinics`

**Estado:** ✅ Funcional + Enhanced (B7)

---

### **14. Admin - Reservations Management** `/admin/reservations-management`
**Funcionalidad:**
- Vista global de todas las reservas
- Filtros avanzados:
  - Por estado
  - Por fecha
  - Por terapeuta
  - Por servicio
- Acciones bulk:
  - Confirmar múltiples
  - Cancelar múltiples
  - Mover fecha/hora
- Export a Excel

**APIs usadas:**
- `GET /api/v1/reservations` (con filtros)
- `PATCH /api/v1/reservations/:id`

**Estado:** ✅ Funcional

---

## 🎨 PANTALLAS CLIENTE (Self-Service)

### **15. Client Dashboard** `/client/dashboard`
**Funcionalidad:**
- Próximas citas
- Historial de reservas
- Balance de créditos
- Membresía activa
- Quick actions:
  - Nueva reserva
  - Cancelar cita
  - Comprar créditos

**APIs usadas:**
- `GET /api/v1/reservations/my-reservations`
- `GET /api/v1/user-packages/balance`
- `GET /api/v1/memberships/my-memberships`

**Estado:** ✅ Creado (FRONT-B8) - **Mock data, requiere backend**

---

### **16. Client Profile** `/client/profile`
**Funcionalidad:**
- Editar información personal
- Cambiar contraseña
- Preferencias de notificaciones
- Método de pago guardado
- Contacto de emergencia

**APIs usadas:**
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

**Estado:** ✅ Creado (FRONT-B8) - **Mock data, requiere backend**

---

## 🔐 PANTALLAS DE AUTENTICACIÓN

### **17. Login** `/login`
**Funcionalidad:**
- Email + password
- 2FA opcional (código por email)
- "Recordarme"
- Link a reset password
- Link a signup

**Flujo:**
```
1. POST /api/v1/auth/login → { twoFactorRequired: true }
2. Usuario ingresa código
3. POST /api/v1/auth/two-factor/verify → { accessToken }
4. Redirect a /dashboard
```

**Estado:** ✅ Funcional
**Issue:** No redirige al workspace correcto si multi-clinic

---

### **18. Signup** `/signup`
**Funcionalidad:**
- Wizard multi-paso:
  1. Seleccionar plan (Starter, Pro, Enterprise)
  2. Datos del workspace (nombre, slug)
  3. Datos del owner (nombre, email, password)
  4. Checkout con Stripe
  5. Success → activar workspace

**Flujo:**
```
1. GET /api/v1/onboarding/plans
2. POST /api/v1/onboarding/check-slug (validar disponibilidad)
3. POST /api/v1/onboarding/signup → { checkoutUrl }
4. Redirect a Stripe Checkout
5. Webhook crea Clinic + Subscription + User
6. Redirect a /onboarding/success
```

**Estado:** ✅ Funcional
**Issue:** Después del success, no hay wizard de configuración inicial

---

### **19. Onboarding Success** `/onboarding/success`
**Funcionalidad:**
- Verifica sesión de Stripe
- Crea JWT token
- Redirige a dashboard

**Estado:** ✅ Funcional
**Issue:** Falta wizard de setup (agregar servicios, horarios, team)

---

## 📊 COMPONENTES REUTILIZABLES

### **UI Components** (`apps/web/src/app/components/ui/`)
- `<EventoraButton />` - Botón principal con variants
- `<GlowCard />` - Card con efecto glow
- `<SectionHeading />` - Header de sección
- `<AuthCard />` - Card para auth flows
- `<InputField />` - Input con label y validación
- `<Modal />` - Modal reutilizable

### **Dashboard Components** (`apps/web/src/app/components/dashboard/`)
- `<Charts />` - Wrapper de Recharts
- `<KPICard />` - Tarjeta de métrica
- `<Timeline />` - Timeline de citas

### **Notification Components** (`apps/web/src/app/components/notifications/`)
- `<TemplateEditor />` - Rich text editor (TipTap) ✅
- `<VariablePicker />` - Selector de variables ✅
- `<TemplatePreview />` - Preview de email ✅

---

## 🔧 HOOKS PERSONALIZADOS

### **`useAuth()`** (`apps/web/src/app/hooks/useAuth.tsx`)
```typescript
const { user, isAuthenticated, login, logout } = useAuth()
// user = { id, email, role, clinicId }
```

### **`useUxMetrics()`** (`apps/web/src/app/hooks/useUxMetrics.tsx`)
```typescript
const track = useUxMetrics('page-name')
track('action', { metadata })
```

---

## 📈 APIS DEL FRONTEND

### **API Client** (`apps/web/src/lib/api-client.ts`)
```typescript
import { apiFetch } from '@/lib/api-client'

const data = await apiFetch<T>('/api/v1/endpoint', {
  method: 'POST',
  json: { ... }
})
```

### **Admin API** (`apps/web/src/lib/admin-api.ts`)
Funciones helper para endpoints comunes:
- `getReportSummary()`
- `getTopServices()`
- `getNotificationTemplates()`
- `updateNotificationTemplate()`
- `getPublicBranches()`
- `getPublicServices()`
- `getPublicClinics()`

---

## ⚠️ GAPS DETECTADOS

### **Críticos (bloquean venta):**
1. ❌ **Login no detecta workspace del usuario** → `/dashboard` genérico
2. ❌ **Booking público requiere clinicId manual** → necesita `/book/[slug]`
3. ❌ **No hay wizard de setup post-signup** → cliente llega a dashboard vacío
4. ❌ **Stripe Connect onboarding incompleto** → clínica no puede recibir pagos

### **Importantes (mejoran UX):**
5. ⚠️ **Client portal usa mock data** → necesita APIs reales
6. ⚠️ **No hay manual/tutorial** → clientes no saben cómo usar
7. ⚠️ **No hay página de status/health** → no se puede monitorear
8. ⚠️ **Calendario básico** → falta drag & drop, vista semanal

### **Nice to have:**
9. 🔵 Custom domains/subdomains
10. 🔵 Widget embebible
11. 🔵 Landing pública con pricing
12. 🔵 Billing portal completo

---

## 🎯 PRÓXIMOS PASOS

Ver tickets creados en `/docs/tickets/`:
- `LAUNCH-01.md` - Login con workspace detection
- `LAUNCH-02.md` - Booking público por slug
- `LAUNCH-03.md` - Setup wizard post-signup
- `LAUNCH-04.md` - Stripe Connect completion
- `LAUNCH-05.md` - Client portal backend integration

---

**Total de pantallas:** 19 principales + 6 modales/wizards  
**Total de componentes:** 25+ reutilizables  
**Total de APIs usadas:** 40+ endpoints  

**Estado general:** 85% funcional para operación asistida (manual setup)  
**Para venta directa:** Requiere 3-4 fixes críticos (15-20h)
