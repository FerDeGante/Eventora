# Decisions Log — Eventora

> Regla: si una decisión afecta datos, seguridad, arquitectura o UX global, se registra aquí.

---

## 2026-01-21 — Frontend RBAC Guardrails (UI + rutas)

**Contexto:**  
El frontend mostraba navegación y rutas sin validación por rol, lo que permitía deep links hacia secciones sensibles sin feedback claro.

**Opciones consideradas:**
1. Dejar guardrails solo en backend (rechazado por UX y riesgo de exposición visual)
2. Agregar guards en AppChrome + middleware con matriz de roles (elegido)

**Decisión:**  
Implementar matriz de permisos por rol y guardrails en UI/middleware para ocultar navegación, bloquear rutas y mostrar estado “sin acceso” con CTA.

**Consecuencias:**
- Menor exposición de UI sensible
- Experiencia consistente por rol
- Redirección segura para roles sin acceso

**Archivos modificados:**
- `apps/web/src/lib/rbac.ts`
- `apps/web/src/app/components/shell/AppChrome.tsx`
- `apps/web/src/app/components/AccessDenied.tsx`
- `apps/web/src/app/hooks/useAuth.tsx`
- `apps/web/middleware.ts`

---

## 2026-01-21 — UX Metrics del funnel Booking → Checkout → Check-in

**Contexto:**  
El flujo público de booking/checkout y el check-in no emitían eventos KPI, lo que impedía medir ocupación, time-to-cash y no-show.

**Decisión:**  
Instrumentar eventos UX mínimos (booking_started, slot_selected, checkout_started, payment_completed, checkin_completed, no_show_marked) usando `useUxMetrics`, sin PII y con IDs/fechas de contexto.

**Consecuencias:**
- Visibilidad del funnel en observabilidad
- Payloads consistentes y sin datos sensibles

**Archivos modificados:**
- `apps/web/src/app/book/[slug]/page.tsx`
- `apps/web/src/app/book/[slug]/checkout/page.tsx`
- `apps/web/src/app/(app)/calendar/page.tsx`

---

## 2026-01-21 — Booking/Checkout alineados a Design System (CSS Modules + tokens)

**Contexto:**  
Booking widget y checkout público usaban estilos inline con colores hardcoded y sin tokens del Design System, afectando consistencia y a11y.

**Opciones consideradas:**
1. Mantener estilos inline con ajustes puntuales (rechazado por deuda visual y foco)
2. Migrar a CSS Modules con tokens y componentes base (elegido)

**Decisión:**  
Migrar booking y checkout a CSS Modules con tokens, usar `EventoraButton` y añadir estados/focus visibles consistentes.

**Consecuencias:**
- Consistencia visual Apple-like en funnel público
- Mejor accesibilidad con focus visible y aria-labels
- Mantenimiento más claro al separar estilos por módulo

**Archivos modificados:**
- `apps/web/src/app/book/[slug]/page.tsx`
- `apps/web/src/app/book/[slug]/BookingWidget.module.css`
- `apps/web/src/app/book/[slug]/checkout/page.tsx`
- `apps/web/src/app/book/[slug]/Checkout.module.css`

---

## 2026-01-19 — Security Hardening Pre-Launch

**Contexto:**  
Auditoría exhaustiva reveló que CORS y Helmet estaban comentados en el código, y varios endpoints carecían de autenticación.

**Opciones consideradas:**
1. Dejar para post-launch (rechazado por riesgo de seguridad)
2. Implementar fixes inmediatos (elegido)

**Decisión:**  
- Habilitar CORS con headers permitidos explícitos
- Habilitar Helmet con CSP en producción
- Agregar `app.authenticate` a POST /users
- Agregar `app.authenticate` a notification templates
- Agregar rate limiting (10/60s) a POST /reservations

**Consecuencias:**
- API más segura
- Breaking change: POST /users ahora requiere JWT

**Archivos modificados:**
- `apps/api/src/plugins/security.ts`
- `apps/api/src/modules/users/user.routes.ts`
- `apps/api/src/modules/notifications/notificationTemplate.routes.ts`
- `apps/api/src/modules/reservations/reservation.routes.ts`

---

## 2026-01-19 — React Query v5 Migration

**Contexto:**  
Frontend usaba sintaxis de React Query v4 (`onError`, `onSuccess` en useQuery, `isLoading` en mutations).

**Decisión:**  
- Migrar a sintaxis v5: eliminar callbacks de useQuery
- Cambiar `isLoading` → `isPending` en mutations
- Manejar errores con useEffect

**Consecuencias:**
- TypeScript compila sin errores
- Patrón consistente en toda la app

**Archivos modificados:**
- `apps/web/src/app/(app)/notifications/page.tsx`
- `apps/web/src/app/(app)/pos/page.tsx`
- `apps/web/src/app/components/OnboardingPanel.tsx`

---

## 2026-01-19 — Import Path Standardization

**Contexto:**  
Imports usaban rutas relativas (`../../lib/`) que fallaban desde `src/app/(app)/*/page.tsx`.

**Decisión:**  
Usar alias `@/` configurado en tsconfig.json:
- `@/lib/*` para librerías
- `@/app/components/*` para componentes

**Consecuencias:**
- Imports consistentes y predecibles
- Fácil refactoring de estructura

---

## 2026-01-19 — EventoraButton Props Extension

**Contexto:**  
Componente `EventoraButton` no tenía props `disabled` ni `type`, causando errores TypeScript en forms.

**Decisión:**  
Agregar props opcionales:
- `disabled?: boolean`
- `type?: "button" | "submit" | "reset"`

**Consecuencias:**
- Componente más versátil
- Ningún breaking change (props opcionales)

**Archivo modificado:**
- `apps/web/src/app/components/ui/EventoraButton.tsx`

---

## Template para nuevas decisiones

```markdown
## YYYY-MM-DD — Decision: <título>

**Contexto:**  
[Por qué surgió esta decisión]

**Opciones consideradas:**
1. Opción A
```

---

## 2026-01-19 — Public Booking Widget Architecture

**Contexto:**  
El widget de booking para clientes finales debe ser accesible sin autenticación, pero necesita crear reservaciones y procesar pagos con Stripe Connect.

**Opciones consideradas:**
1. Usar el mismo endpoint de reservaciones con un token temporal (complejidad alta)
2. Crear endpoints públicos separados en `/api/v1/public/*` (elegido)
3. API Gateway separado (overkill para MVP)

**Decisión:**  
Crear namespace público `/api/v1/public` con endpoints específicos:
- `GET /clinics/:slug` - Datos públicos de clínica
- `POST /bookings` - Crear reservación sin auth
- `GET /bookings/:id` - Status de reservación
- `POST /bookings/:id/checkout` - Crear Stripe Checkout session

**Consecuencias:**
- Separación clara entre rutas autenticadas y públicas
- Menor superficie de ataque (endpoints públicos limitados)
- Flujo simple para clientes finales

**Archivos creados/modificados:**
- `apps/api/src/modules/marketplace/public.routes.ts`
- `apps/api/src/modules/marketplace/public-booking.service.ts`
- `apps/api/src/modules/marketplace/public.service.ts`

---

## 2026-01-19 — Stripe Connect Split Model

**Contexto:**  
Eventora cobra comisión por transacción (3% default). Necesitamos decidir cómo implementar el split de pagos.

**Opciones consideradas:**
1. PaymentIntent con `application_fee_amount` (elegido)
2. Separate Charges and Transfers (más complejo)
3. Destination Charges sin fee (no genera revenue)

**Decisión:**  
Usar Stripe Checkout Sessions con:
- `payment_intent_data.application_fee_amount` para comisión
- `transfer_data.destination` para cuenta Connect del negocio
- Fee configurable por plan en `Plan.transactionFee` (basis points)

**Fórmula:**
```
applicationFee = Math.round((amount * transactionFee) / 10000)
```
Ejemplo: $500 MXN * 300bp = $15 MXN comisión

**Consecuencias:**
- Ingreso automático a Eventora
- Negocios reciben pago neto inmediato
- Flexible por tier de plan

**Archivos modificados:**
- `apps/api/src/modules/marketplace/public-booking.service.ts`
- `apps/api/src/modules/connect/connect.service.ts`

---

## 2026-01-19 — Inline Styles for Widget Pages

**Contexto:**  
Las páginas del widget público (`/book/[slug]/*`) necesitan ser embebibles en iframes y funcionar sin dependencia de CSS externo.

**Opciones consideradas:**
1. Usar Tailwind (requiere build completo)
2. CSS Modules (funciona pero más archivos)
3. Inline styles con objetos TypeScript (elegido)

**Decisión:**  
Usar inline styles con objetos `React.CSSProperties` tipados. Esto permite:
- Theming dinámico (`clinic.primaryColor`)
- Zero dependencies externas
- Funciona en iframes aislados

**Trade-offs:**
- Código más verboso
- Sin pseudo-selectores nativos (workarounds con state)
- No cacheable separadamente

**Archivos afectados:**
- `apps/web/src/app/book/[slug]/page.tsx` (~900 líneas)
- `apps/web/src/app/book/[slug]/checkout/page.tsx` (~500 líneas)

---

## 2026-01-19 — Membership Types Enum

**Contexto:**  
Las membresías tienen diferentes modelos de uso (ilimitadas, por sesiones, por tiempo). Necesitamos representar esto de forma clara.

**Decisión:**  
Definir 4 tipos en el enum `MembershipType`:
- `UNLIMITED` - Acceso sin límite de sesiones
- `SESSIONS_TOTAL` - Número fijo de sesiones (ej: 10 sesiones)
- `SESSIONS_PERIOD` - Sesiones por periodo (ej: 8/mes)
- `TIME_BASED` - Acceso por duración (ej: 30 días)

Campos condicionales en UI según tipo seleccionado.

**Consecuencias:**
- UI adaptativa muestra solo campos relevantes
- Validación clara en backend
- Fácil de extender con nuevos tipos

**Archivos afectados:**
- `prisma/schema.prisma` (enum MembershipType)
- `apps/web/src/app/(app)/memberships/page.tsx`
- `apps/web/src/lib/admin-api.ts`
2. Opción B

**Decisión:**  
[Qué se decidió]

**Consecuencias:**
- [Impactos positivos]
- [Impactos negativos/tradeoffs]

**Tickets relacionados:**
- T-XXXX
```

---

## 2026-01-20 — Transactional Email Architecture

**Contexto:**  
B1 requería emails transaccionales automáticos para reservaciones, pagos, y onboarding.

**Decisión:**  
Crear `transactionalEmail.service.ts` que reutiliza plantillas del sistema de notificaciones y proporciona funciones tipadas para cada tipo de email.

**Archivos afectados:**
- `apps/api/src/modules/notifications/transactionalEmail.service.ts` (nuevo)
- `apps/api/src/modules/onboarding/onboarding.service.ts`
- `apps/api/src/modules/marketplace/public-booking.service.ts`
- `apps/api/src/modules/payments/payment.service.ts`

---

## 2026-01-20 — Quick Reservation from Calendar

**Contexto:**  
B2 requería crear reservaciones con un click desde el calendario.

**Decisión:**  
Extender POST /reservations para aceptar `clientName + clientEmail`. Si se proporciona, buscar o crear usuario automáticamente.

**Archivos afectados:**
- `apps/api/src/modu
---

## 2026-01-20 — Transactional Email Architecture

**Contexto:**  
B1 requevat
on.s
**Contexto:**  
B1 requería emails transaccionae.tB1 requería e02
**Decisión:**  
Crear `transactionalEmail.service.ts` que reutiliza plantillas del siscliCrear `transactes
**Archivos afectados:**
- `apps/api/src/modules/notifications/transactionalEmail.service.ts` (nuevo)
- `apps/api/src/modules/onboarding/onboarding. `a- `apps/api/src/moduleer- `apps/api/src/modules/onboarding/onboarding.service.ts`
- `apps/api/src/mb/- `apps/api/src/modules/marketplace/public-booking.serviRe- `apps/api/src/modules/payments/payment.service.ts`

---

##re
---

## 2026-01-20 — Quick Reservation from Calesi?#:**
**Contexto:**  
B2 requería crear reservacionerviB2 requería cy 
**Decisión:**  
Extender POST /reservations para aceptar `clien`apExtender POST /le
**Archivos afectados:**
- `apps/api/src/modu
---

## 2026-01-20 — Transactional Email Architecture

**Contexto:**  
B1 requevo)
