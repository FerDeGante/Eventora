# Eventora • Arquitectura de motor de reservaciones y gestión de clínicas

## 1. Visión y principios
- **Producto**: plataforma multi-clínica para fisioterapia, spa, belleza y wellness. Incluye motor de reservaciones “tipo Airbnb”, backoffice administrativo, operaciones del staff y base para un POS integrado.
- **Tenancy**: todos los datos se aíslan por `clinicId`. El contexto de inquilino se obtiene desde subdominio/host o sesión y se inyecta automáticamente en Prisma mediante middleware.
- **Pagos**: Stripe como procesador en línea (Checkout + Webhooks). Preparado para POS (efectivo, terminal física) mediante abstracción `PaymentIntent`.
- **Extensibilidad**: arquitectura modular (Availability, Billing, Catalog, CRM, POS, Notifications). Todos los módulos publican eventos a `AuditLog`.
- **Experiencia de usuario**: unifica flujos (wizard de reserva único, dashboards consistentes, sistema de diseño “Eventora Aura”).

## 2. Dominios y entidades
```
Clinic --< Branch --< Resource
  |        |
  |        --< AvailabilityTemplate / AvailabilityException
  |
  --< User (roles: ADMIN, MANAGER, RECEPTION, THERAPIST, CLIENT)
          |
          -- Staff (solo roles operativos) --< TherapistProfile --< TherapistSchedule

ServiceCategory --< Service --< PackageService >-- Package
Package --< UserPackage --< Reservation --< CheckIn / Note / PaymentIntent
Reservation -- PaymentIntent (Stripe, Cash, POS)
Notification (email/sms/push)
AuditLog capturando todo cambio
```

## 3. Modelo relacional propuesto
> Tipos referenciales basados en PostgreSQL. Todas las tablas tienen `created_at`, `updated_at`.

| Tabla | Campos claves |
| --- | --- |
| **clinic** | `id PK`, `name`, `slug UNIQUE`, `owner_user_id FK`, `stripe_account_id`, `settings JSONB` |
| **branch** | `id PK`, `clinic_id FK`, `name`, `address`, `timezone`, `phone` |
| **user** | `id PK`, `clinic_id FK`, `email UNIQUE`, `password_hash`, `role ENUM`, `status`, `last_login_at` |
| **staff** | `id PK`, `user_id FK UNIQUE`, `branch_id FK NULL`, `permissions JSONB`, `color_tag`, `job_title` |
| **therapist_profile** | `id PK`, `staff_id FK UNIQUE`, `specialties TEXT[]`, `bio`, `avg_session_minutes` |
| **service_category** | `id PK`, `clinic_id FK`, `name`, `color_hex`, `sort_order` |
| **service** | `id PK`, `clinic_id FK`, `category_id FK`, `name`, `description`, `default_duration`, `base_price`, `requires_resource BOOL`, `is_active BOOL` |
| **package** | `id PK`, `clinic_id FK`, `name`, `description`, `sessions INT`, `validity_days INT`, `default_duration INT`, `base_price`, `stripe_price_id`, `inscription_fee`, `status ENUM` |
| **package_service** | `id PK`, `package_id FK`, `service_id FK`, `mandatory BOOL`, `sequence INT` |
| **resource** | `id PK`, `clinic_id FK`, `branch_id FK`, `type ENUM(pool,cabin,equipment)`, `name`, `capacity`, `tags TEXT[]` |
| **availability_template** | `id PK`, `clinic_id FK`, `owner_type ENUM(branch,therapist,resource,service)`, `owner_id`, `weekday SMALLINT`, `start_time`, `end_time`, `slot_duration`, `capacity` |
| **availability_exception** | `id PK`, `clinic_id FK`, `owner_type`, `owner_id`, `date`, `closed BOOL`, `replacement_slots JSONB`, `note` |
| **user_package** | `id PK`, `clinic_id FK`, `user_id FK`, `package_id FK`, `sessions_total`, `sessions_remaining`, `start_date`, `expiry_date`, `price_paid`, `payment_source ENUM(stripe,cash,pos)`, `metadata JSONB` |
| **reservation** | `id PK`, `clinic_id FK`, `branch_id FK`, `service_id FK`, `package_id FK NULL`, `user_package_id FK NULL`, `user_id FK`, `therapist_id FK NULL (staff)`, `resource_id FK NULL`, `start_at`, `end_at`, `status ENUM(pending,confirmed,checked_in,completed,cancelled,no_show)`, `payment_status ENUM(unpaid,authorized,paid,refunded)`, `payment_intent_id FK NULL`, `notes TEXT` |
| **payment_intent** | `id PK`, `clinic_id FK`, `amount`, `currency`, `provider ENUM(stripe,cash,pos)`, `provider_ref`, `status ENUM`, `reservation_id FK NULL`, `user_package_id FK NULL`, `created_by_staff_id FK NULL` |
| **check_in** | `id PK`, `reservation_id FK`, `staff_id FK`, `status ENUM(arrived,in_session,completed)`, `timestamp`, `comment` |
| **notification** | `id PK`, `clinic_id FK`, `user_id FK`, `channel ENUM(email,sms,push)`, `template`, `payload JSONB`, `status ENUM`, `scheduled_at` |
| **audit_log** | `id PK`, `clinic_id FK`, `actor_user_id FK`, `entity_type`, `entity_id`, `action`, `diff JSONB`, `ip`, `user_agent` |

## 4. Middleware tenancy & seguridad
```ts
prisma.$use((params, next) => {
  const tenantId = tenantContext.get();
  if (!tenantId && tenantRequired(params)) throw new Error("Missing clinic context");
  if (tenantScopedModel(params.model)) {
    params.args ??= {};
    scopeArgsByAction(params, tenantId);
  }
  return next(params);
});
```
- `tenantContext` se alimenta desde middleware Next.js (`match /admin|/staff|/client`) y para rutas públicas desde `resolveTenant(req)`.
- Roles + permisos se adjuntan al JWT (`session.user.roles`, `session.user.scopes`). El middleware HTTP valida `role` antes de entrar a cada controlador.

## 5. Servicios backend
### 5.1 Availability Service
- Entradas: `clinicId`, `serviceId`, `branchId`, `therapistId?`, `date`.
- Pasos: mezclar plantillas + excepciones → excluir reservas existentes → aplicar aforos por recurso/terapeuta → devolver slots (hora, recurso, capacidad, estado).
- Expone API REST (`GET /api/public/{clinic}/availability`) y funciones internas para Staff/Admin.
- Cache (Redis) por `[clinicId, ownerType, ownerId, date]` durante 5 min; invalidar al crear/cancelar reservas.

### 5.2 Catalog Service
- CRUD de servicios, paquetes, recursos. Usa versiones/borradores para publicar cambios masivos.

### 5.3 Billing Service
- Wrapper Stripe: crea sesiones Checkout con metadata `{ clinicId, userId, packageId/reservationId }`.
- Webhook: valida `clinicId`, asegura que la cuenta conectada coincide, y dispara `PaymentIntent` + `Reservation` o `UserPackage`.
- POS: endpoints `POST /staff/payments/cash` y `POST /staff/payments/pos` que crean `PaymentIntent` con recibo.

### 5.4 Notification Service
- Plantillas transaccionales (confirmación, recordatorio, cancelación, pagos fallidos).  
- Programador (cron/queue) que lee `notification` y envía por SendGrid/Twilio.

## 6. API REST (resumen)
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/password/reset`.
- `GET /api/public/:clinic/services`, `GET /api/public/:clinic/packages`, `GET /api/public/:clinic/availability`.
- `GET /api/client/me`, `GET /api/client/reservations`, `POST /api/client/reservations` (wizard steps: availability → hold → confirm/pagar).
- `GET /api/staff/calendar?date=…`, `POST /api/staff/reservations` (manual), `PATCH /api/staff/reservations/:id` (reprogramar), `POST /api/staff/reservations/:id/check-in`, `POST /api/staff/payments`.
- `GET/POST /api/admin/clinics`, `GET/POST /api/admin/branches`, `GET/POST/PATCH /api/admin/services`, `GET/POST/PATCH /api/admin/packages`, `GET/POST /api/admin/resources`, `GET/POST /api/admin/staff`, `GET /api/admin/reports` (kpis), `GET /api/admin/audit`.
- Webhooks: `/api/webhooks/stripe`, `/api/webhooks/payouts` (futuro).

## 7. Flujo de reserva unificado
1. Cliente selecciona servicio/paquete y branch → consulta Availability Service.
2. API reserva slot provisional (status `pending`, TTL 5 min).
3. Cliente confirma datos y paga (Stripe) o se marca “Pago en sucursal”.
4. Webhook / confirmación cambia a `confirmed`, descuenta sesión (`user_package.sessions_remaining--`), genera notificaciones y eventos de calendar.
5. Staff usa panel para check-in y actualizar estado/pago.

## 8. UX / UI “Eventora Aura”
- **Tokens**: `--primary #60bac2`, `--secondary #cca8d6`, `--accent #e6a376`, `--success #68d4b6`, `--warning #f5c978`, `--error #f06c9b`, tipografías `Inter` (body) + `Sora` (display).
- **Componentes base**: `EventoraButton`, `EventoraCard`, `PillTabs`, `CalendarTile`, `SlotBadge`, `ModalSheet`, `Stepper`, `Toast`, `DataList`, `StatWidget`.
- **Admin Dashboard**: layout de 2 columnas (sidebar sticky + workspace). Home con KPIs (reservas hoy, ocupación por recurso, ingresos). Secciones: Catálogo (grid con filtros), Staff (cards con disponibilidad), Reportes (charts combinar React-ChartJS + tablas), Config (wizard Stripe/POS).
- **Staff Experience**: vista calendario semanal (horizontal) + tablero Kanban (Por llegar / En sesión / Finalizadas). Modales contextuales con acciones rápidas (check-in, cobrar, reagendar). Estado de pagos con badges y timeline.
- **Cliente**: wizard multipaso con stripe-like UI (cards 3D, microinteracciones). Dashboard personal muestra wallet de sesiones, historial con timeline, botones “Reagendar”, “Agregar a Google Calendar”, “Contactar”.
- **Responsivo**: en móvil, los calendarios se convierten en listas de slots y los modales adoptan formato bottom sheet.
- **Accesibilidad**: contraste AA, focus ring visible, soporte teclado, textos descriptivos en iconos.

## 9. Roadmap de implementación
1. **Migración de datos**: añadir `clinicId` y tablas nuevas en Prisma; escribir scripts de backfill; activar middleware tenant-aware.
2. **Availability Service + wizard**: reemplazar flujos legacy (`ReservasForm`, etc.) por el motor nuevo.
3. **Catalog & Package Builder**: CRUD admin + seed dinámico (ya no `lib/packages.ts`).
4. **Staff/Admin UI**: crear sistema de componentes `Eventora Aura`, migrar dashboards y calendarios.
5. **Billing & POS prep**: refactor Checkout + webhooks + endpoints de caja.
6. **Notificaciones avanzadas** y analíticas.
7. **POS físico** (cuando se incorpore hardware).

## 10. Roadmap ABC (backend)

### A (Imprescindible)
1. **Autenticación y gestión de usuarios**
   - JWT / sesiones para clientes y staff.
   - CRUD de usuarios, roles y staff (invitar, suspender, asignar branch).
2. **Disponibilidad & Reservas**
   - Availability Service completo (templates, overrides, validación de recursos).
   - Endpoints públicos `/public/:clinic/availability`.
   - Reglas avanzadas de reservas (holds, reprogramaciones, cancelaciones).
3. **Pagos**
   - PaymentIntent API (Stripe Checkout + webhooks, pagos en caja).
   - Integración Mercado Pago opcional.
   - Estados financieros y reconciliación.

### B (Debería tenerse pronto)
1. **Paquetes avanzados**
   - Builder drag-and-drop, versiones/borradores, upsells.
2. **User Packages & Wallet**
   - Endpoints para asignar, renovar, transferir sesiones.
3. **Notificaciones**
   - Recordatorios, confirmaciones, comunicaciones de pago.
4. **Reportes y auditoría**
   - KPIs, exportaciones, AuditLog navegable.

### C (Nice to have / posterior)
1. **POS físico y hardware**
   - Integración con terminales, cajas, inventario.
2. **Marketplace / directorio público**
   - Landing multi-clínica, búsqueda por ciudad, reservas cross-clinic.
3. **Integraciones externas**
   - Google Calendar bi-direccional, WhatsApp Business, BI externo.

El roadmap ABC permite atacar primero los bloques críticos (A) antes de extenderse a mejoras B/C.

Este documento sirve como contrato inicial para guiar el refactor de Eventora hacia un motor premium multi-clínica listo para escalar y recibir el módulo POS.

## 11. Roadmap ABC (frontend)

### A (Imprescindible)
1. **Migración Next.js 16 + Auth**
   - App Router con layout universal, SSR híbrido y consumo de la nueva API (login/2FA, sesiones con JWT).
   - Providers globales (QueryClient, Theme, Intl) y manejo de estados protegidos.
2. **Sistema de diseño “Eventora Aura Neo”**
   - Inspirado en Chrome/Gemini: tipografía variable (Sora/Inter), gradientes fluidos, glassmorphism, animaciones GSAP/Framer, componentes reutilizables (Hero 3D, Section cards, CTA animadas, tabs, timeline, modales). Paleta dinámica con tokens (dark/light, gradient seeds) y motion tokens (curvas, durations).
   - Inclusión de microinteracciones (parallax, hover states, scroll transforms) y soporte tipográfico (Display, Sans, Monospace), iconografía consistente.
3. **Wizard de reserva + Panel Admin/Staff**
   - Wizard con animaciones multiplanos (estilo Chrome onboarding) consumiendo `/public/*`, pagos integrados y wallet.
   - Paneles admin/staff/paciente reutilizando los nuevos componentes, dashboards interactivos, POS UI, notificaciones y marketplace.

### B (Debería tenerse pronto)
1. **Profundización Eventora Aura Neo**
   - Editor de temas, modo responsive con transiciones contextuales, biblioteca de animaciones reutilizable, dark mode avanzado.
2. **Portal Marketplace**
   - Landing multi-clínica usando `/api/v1/public/*`, SEO y páginas por clínica/servicio.
3. **Automatizaciones UX**
   - Recordatorios visibles en UI, wallet del cliente, historial con exportables, editor visual de plantillas.

### C (Nice to have / posterior)
1. **Apps/páginas dedicadas para POS**
   - UI de caja (abir/cerrar turnos, imprimir tickets, ver print jobs en tiempo real).
2. **Integraciones externas embebidas**
   - Configuradores Google/WhatsApp, botones “Enviar a WhatsApp”, calendario incrustado.
3. **Herramientas de BI/insights**
   - Embeds de dashboards externos, alertas en tiempo real, comparativos multi-sucursal.

El frontend debe iterar siguiendo este roadmap para aprovechar todo el backend ya listo.
