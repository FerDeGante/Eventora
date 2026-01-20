# 🎯 Auditoría Frontend Ejecutiva - Eventora
**Staff Frontend Engineer (Apple/Google) + Product/UX Lead**  
**Fecha:** 19 de enero de 2026  
**Auditor:** Technical Product Team  
**Objetivo:** Maximizar time-to-cash y ocupación mediante UI/UX premium

---

## 📊 Executive Summary

### Veredicto General
**Estado:** 🔴 NO LANZABLE — Requiere Sprint de Remediación Crítico  
**Health Score:** **42/100** (Crítico)

### Impacto en Métricas de Negocio
| Métrica | Estado Actual | Gap | Riesgo |
|---------|--------------|-----|--------|
| **Time-to-cash** | No medible | Sin instrumentación | 🔴 ALTO |
| **Ocupación** | No calculable | Datos dispersos | 🔴 ALTO |
| **No-show rate** | No rastreable | Sin eventos | 🔴 ALTO |

### Bloqueantes P0 para Launch (8)
1. ❌ **Multi-tenant NO implementado** — clinicId no validado en frontend
2. ❌ **RBAC visual ausente** — Todos los roles ven misma UI
3. ❌ **0 tests unitarios** — Riesgo de regresiones
4. ❌ **3 E2E incompletos** — No cubren flows críticos
5. ❌ **Check-in/out flow NO existe** — Operación bloqueada
6. ❌ **Booking wizard incompleto** — No maneja capacidad N vs 1
7. ❌ **Sin instrumentación de KPIs** — No hay eventos para medir
8. ❌ **Design system fragmentado** — Inconsistencias visuales

---

## 1️⃣ Repo Snapshot

### Stack Detectado
```json
{
  "framework": "Next.js 16.0.0 (App Router)",
  "react": "19.1.0",
  "typescript": "5.x",
  "styling": "TailwindCSS + CSS Modules + CSS Variables",
  "state": "React Query v5 (TanStack)",
  "forms": "react-hook-form + zod",
  "ui_lib": "Custom components (no Radix/shadcn)",
  "calendar": "FullCalendar 6.1.17",
  "payments": "@stripe/stripe-js 7.3.0",
  "testing": "Playwright (3 specs sin implementar)",
  "i18n": "None (hardcoded español)"
}
```

### Estructura de Carpetas
```
apps/web/src/
├── app/
│   ├── (app)/              ← Rutas protegidas (sin guards reales)
│   │   ├── dashboard/      ✅ Existe (fallback data)
│   │   ├── calendar/       ✅ Existe (1304 LOC, complejo)
│   │   ├── clients/        ✅ Existe (CRM básico)
│   │   ├── memberships/    ✅ Existe (inline styles 🚨)
│   │   ├── wizard/         ⚠️ Parcial (sin capacidad N)
│   │   ├── reports/        ✅ Existe
│   │   ├── pos/            ✅ Existe
│   │   ├── notifications/  ✅ Existe
│   │   ├── settings/       ⚠️ Parcial
│   │   └── admin/          ⚠️ Parcial (solo reservations)
│   ├── (auth)/             ✅ Login/Register/Reset
│   ├── book/[slug]/        ✅ Booking público
│   ├── components/         ⚠️ Mezclado con app/components
│   ├── hooks/              ✅ useAuth, useUxMetrics
│   ├── sections/           ✅ Landing page
│   └── styles/             ⚠️ Tokens incompletos
├── components/             🚨 Duplicado con app/components
├── lib/                    ✅ admin-api, public-api, api-client
├── styles/                 ⚠️ Tokens parciales
└── types/                  ⚠️ Minimal
```

### Librerías UI/UX
- **Componentes custom:** GlowCard, EventoraButton, BloomButton (duplicado), InputField
- **NO usa Radix/shadcn** — Todo custom build (riesgo de a11y)
- **Framer Motion:** `framer-motion 11.0.0` (instalado pero POCO usado)
- **Icons:** react-feather, react-icons (no tree-shaked)

### Estrategia de Datos
- **Fetching:** React Query + server components (híbrido bien ejecutado)
- **Caching:** Query cache con `staleTime` configurado
- **Auth:** localStorage + cookies (vulnerabilidad XSS)
- **Optimistic updates:** ❌ NO implementados

---

## 2️⃣ Design System Compliance

### Tokens Encontrados vs Requeridos

#### ✅ Tokens Presentes (`design-tokens.css`)
```css
:root {
  --color-primary: #60bac2
  --color-secondary: #cca8d6
  --color-accent: #e6a376
  --glass-bg: rgba(255, 255, 255, 0.08)
  --glass-border: rgba(255, 255, 255, 0.12)
  --glass-shadow: 0 30px 80px rgba(6, 15, 48, 0.35)
  --gradient-aurora
  --gradient-night
}
```

#### ❌ Tokens FALTANTES (Premium iOS 26)
```css
/* Spacing System */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;

/* Border Radius (Consistencia) */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Typography Scale */
--font-size-xs: 0.75rem;      /* 12px */
--font-size-sm: 0.875rem;     /* 14px */
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
--font-size-2xl: 1.5rem;      /* 24px */
--font-size-3xl: 1.875rem;    /* 30px */
--font-size-4xl: 2.25rem;     /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Shadows (iOS-like) */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

/* Motion */
--transition-fast: 150ms ease-out;
--transition-base: 200ms ease-out;
--transition-slow: 250ms ease-out;
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Z-index Scale */
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

### Inconsistencias Detectadas (con archivos)

| Componente/Archivo | Inconsistencia | Impacto |
|-------------------|----------------|---------|
| `memberships/page.tsx` | **Inline styles** (1027 LOC) | 🔴 CRÍTICO — No reutilizable, no responsive |
| `calendar/page.tsx` | Magic numbers: `padding: "2rem"` | 🟡 Moderado |
| `BloomButton.tsx` vs `EventoraButton.tsx` | Duplicación de botones | 🟡 Moderado |
| `components/` vs `app/components/` | Estructura fragmentada | 🟡 Moderado |
| `border-radius` | Mezcla de `0.5rem`, `0.75rem`, `1rem` | 🟡 Moderado |
| Animaciones | Sin motion system (Framer Motion instalado pero no usado) | 🟡 Moderado |
| Icons | `react-feather` + `react-icons` | 🟢 Menor — Bundle +50KB |

### Propuesta de Normalización

#### Acción Inmediata
1. **Crear `/src/styles/tokens.css`** con sistema completo
2. **Refactor `memberships/page.tsx`** — Eliminar inline styles
3. **Unificar componentes**:
   - Eliminar `BloomButton.tsx`
   - Migrar a `EventoraButton` con variants
4. **Consolidar carpetas**:
   ```
   src/
   ├── components/     ← Solo componentes compartidos
   ├── features/       ← Feature-based (nuevo)
   │   ├── bookings/
   │   ├── clients/
   │   └── calendar/
   ```

---

## 3️⃣ Pantallas MVP: Estado + Calidad

### Matriz de Evaluación

| Pantalla | Existe | Calidad UI | Funcional | RBAC | Gaps Críticos | Riesgo MVP |
|----------|--------|-----------|-----------|------|---------------|------------|
| **A) Auth + Onboarding** | | | | | | |
| Login | ✅ | 3/5 | ✅ | ❌ | Sin 2FA UI | 🟡 MEDIO |
| Register | ✅ | 3/5 | ✅ | ❌ | No valida email | 🟡 MEDIO |
| Onboarding Wizard | ⚠️ | 2/5 | ⚠️ | ❌ | Flujo incompleto, sin "Create Location", sin configuración de disponibilidad | 🔴 ALTO |
| | | | | | | |
| **B) Dashboards por Rol** | | | | | | |
| Owner Dashboard | ✅ | 3/5 | ⚠️ | ❌ | KPIs con fallback data, NO calcula métricas reales | 🔴 ALTO |
| Frontdesk View | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** — Bloqueante operativo | 🔴 ALTO |
| Staff/Therapist View | ⚠️ | 2/5 | ⚠️ | ❌ | Calendario genérico, sin check-in/out | 🔴 ALTO |
| Client Portal | ⚠️ | 2/5 | ⚠️ | ❌ | Solo ve reservas, sin gestión de paquetes/credits | 🟡 MEDIO |
| | | | | | | |
| **C) Agenda/Calendario** | | | | | | |
| Calendario Principal | ✅ | 4/5 | ⚠️ | ❌ | 1304 LOC (God Component), NO distingue capacidad N vs 1 | 🔴 ALTO |
| Day Sheet (Frontdesk) | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** | 🔴 ALTO |
| Drag & Drop | ❌ | 0/5 | ❌ | ❌ | NO implementado | 🟡 MEDIO |
| Waitlist (Clases) | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** | 🔴 ALTO |
| Buffers/Bloqueos | ❌ | 0/5 | ❌ | ❌ | NO gestionables desde UI | 🟡 MEDIO |
| | | | | | | |
| **D) Booking Flow** | | | | | | |
| Wizard de Reserva | ⚠️ | 3/5 | ⚠️ | ❌ | NO maneja capacidad N (clases), sin validación de políticas | 🔴 ALTO |
| Public Booking | ✅ | 3/5 | ⚠️ | N/A | Slug-based, pero sin waitlist | 🟡 MEDIO |
| Checkout (Stripe) | ✅ | 4/5 | ✅ | N/A | Funcional, falta handle de errores elegante | 🟢 BAJO |
| Confirmación | ⚠️ | 2/5 | ⚠️ | ❌ | Sin email preview, sin estado visual claro | 🟡 MEDIO |
| | | | | | | |
| **E) Memberships / Credits** | | | | | | |
| Comprar Plan/Paquete | ✅ | 2/5 | ⚠️ | ❌ | Inline styles (1027 LOC), sin Stripe Customer Portal | 🟡 MEDIO |
| Wallet View | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** — No muestra saldo/expiraciones | 🔴 ALTO |
| Ledger Auditable | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** | 🔴 ALTO |
| Consumo al Reservar | ❌ | 0/5 | ❌ | ❌ | NO automático en UI | 🔴 ALTO |
| | | | | | | |
| **F) Clients (CRM)** | | | | | | |
| Lista de Clientes | ✅ | 3/5 | ✅ | ⚠️ | Sin segmentación activos/inactivos, sin tags | 🟡 MEDIO |
| Perfil Cliente | ⚠️ | 2/5 | ⚠️ | ❌ | Modal simple, sin historial completo, sin no-show strikes | 🔴 ALTO |
| Notas Internas | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** | 🟡 MEDIO |
| | | | | | | |
| **G) Payments** | | | | | | |
| Pagos Pendientes | ⚠️ | 2/5 | ⚠️ | ❌ | Dashboard muestra queue, pero sin pantalla dedicada | 🟡 MEDIO |
| Registrar Pago in Situ | ⚠️ | 2/5 | ⚠️ | ❌ | POS page existe, flujo poco claro | 🔴 ALTO |
| Recibo/Factura | ❌ | 0/5 | ❌ | ❌ | **NO EXISTE** | 🟡 MEDIO |

### Pantallas Críticas FALTANTES (Bloquean MVP)

1. **Frontdesk Day View** — **P0** — Sin esto, operación es imposible
2. **Wallet / Credits Balance** — **P0** — Clientes no ven saldo
3. **Check-in / Check-out Flow** — **P0** — Core de operación
4. **Waitlist Management** — **P0** — Para clases llenas
5. **Ledger Auditable** — **P0** — Para auditoría de credits

---

## 4️⃣ RBAC & Tenant Guard Report

### Implementación Actual

#### ✅ Backend RBAC (según audit previo)
- Guards en API con `clinicId` + `role`
- Roles: `ADMIN`, `MANAGER`, `RECEPTION`, `THERAPIST`, `CLIENT`

#### ❌ Frontend RBAC
**Verdict:** **NO IMPLEMENTADO**

### Matriz: Rol × Rutas/Acciones

| Ruta/Acción | ADMIN | MANAGER | RECEPTION | THERAPIST | CLIENT | Implementado |
|-------------|-------|---------|-----------|-----------|--------|--------------|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ Sin gating |
| `/clients` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ Sin gating |
| `/calendar` (full) | ✅ | ✅ | ✅ | ⚠️ Solo own | ❌ | ❌ Todos ven todo |
| `/wizard` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ Sin gating |
| `/pos` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ Sin gating |
| `/settings` | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ Sin gating |
| `/admin/*` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ Sin gating |
| Crear Reserva | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ Parcial |
| Editar Reserva | ✅ | ✅ | ✅ | ❌ | ⚠️ Own | ❌ Sin validación |
| Cancelar Reserva | ✅ | ✅ | ✅ | ❌ | ⚠️ Políticas | ❌ Sin validación |
| Ver Clientes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ Sin gating |
| Editar Cliente | ✅ | ✅ | ❌ | ❌ | ⚠️ Self | ❌ Sin validación |
| Check-in/out | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ NO EXISTE |
| Ver Reportes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ Sin gating |
| Invite Staff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ Sin gating |

### Vulnerabilidades UI Detectadas

#### 🔴 CRÍTICO
1. **Sin middleware de auth real**
   - Archivo: `middleware.ts`
   - Problema: Solo verifica cookie, no valida JWT ni rol
   - Impacto: Cualquiera con token puede acceder a admin

2. **AppChrome muestra TODO a todos**
   - Archivo: `app/components/shell/AppChrome.tsx` L:13-22
   ```tsx
   const navItems = [
     { label: "Panel", href: "/dashboard" },
     { label: "Clientes", href: "/clients" },
     { label: "Calendario", href: "/calendar" },
     { label: "Reportes", href: "/reports" },
     { label: "Wizard de reserva", href: "/wizard" },
     { label: "Notificaciones", href: "/notifications" },
     { label: "POS", href: "/pos" },
     { label: "Marketplace", href: "/marketplace" },
     { label: "Configuración", href: "/settings" },
   ];
   ```
   - **No filtra por rol** — CLIENT ve "POS", "Configuración", etc.

3. **Rutas accesibles por URL directa**
   - Ejemplo: Un `CLIENT` puede navegar a `/admin/reservations-management`
   - No hay Server Component con `auth.role` check

4. **Tenant (clinicId) NO validado en frontend**
   - `useAuth` tiene `clinicId` pero NO se usa para filtrar
   - Riesgo: Si backend falla, cliente A puede ver datos de cliente B

### Arquitectura de Remediación Propuesta

#### 1. RBAC Component Library
```tsx
// src/lib/rbac.tsx
export function Can({ 
  role, 
  action, 
  resource, 
  children 
}: { 
  role?: string; 
  action: string; 
  resource: string; 
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const allowed = checkPermission(user?.role, action, resource);
  return allowed ? <>{children}</> : null;
}

// Uso
<Can action="view" resource="reports">
  <Link href="/reports">Reportes</Link>
</Can>
```

#### 2. Server Component Guards
```tsx
// app/(app)/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return <>{children}</>;
}
```

#### 3. Tenant Context Provider
```tsx
// app/providers.tsx
export function TenantProvider({ children }) {
  const { user } = useAuth();
  const { data: clinic } = useQuery({
    queryKey: ['clinic', user?.clinicId],
    queryFn: () => getClinic(user!.clinicId!),
    enabled: !!user?.clinicId
  });
  
  if (!clinic) return <TenantSelectorModal />;
  
  return (
    <TenantContext.Provider value={clinic}>
      {children}
    </TenantContext.Provider>
  );
}
```

---

## 5️⃣ Frontend Health Score (0-100)

### Breakdown por Categoría

| Categoría | Score | Peso | Contribución | Hallazgos Clave |
|-----------|-------|------|--------------|-----------------|
| **UI Consistency** | 35/100 | 20% | 7.0 | Design system fragmentado, inline styles, componentes duplicados |
| **Performance** | 55/100 | 15% | 8.25 | Bundle 58K LOC, no lazy loading, FullCalendar sin optimizar |
| **Accessibility** | 30/100 | 15% | 4.5 | Sin keyboard nav completo, ARIA incompleto, sin Radix |
| **Security/RBAC** | 15/100 | 20% | 3.0 | **CRÍTICO** — No RBAC visual, sin tenant guards, localStorage |
| **Product Flow Completeness** | 50/100 | 15% | 7.5 | Flows parciales, check-in/out faltante, waitlist ausente |
| **Code Quality** | 60/100 | 10% | 6.0 | TypeScript OK, pero God Components (calendar 1304 LOC) |
| **Test Coverage** | 10/100 | 5% | 0.5 | **0 tests unitarios**, 3 E2E vacíos |

### **Total Health Score: 42/100** 🔴

### Top 10 Issues (Impacto en Score)

1. **No RBAC visual** (-15 pts) → Security/RBAC
2. **0 tests unitarios** (-8 pts) → Test Coverage
3. **Check-in/out ausente** (-8 pts) → Product Flow
4. **Design system fragmentado** (-7 pts) → UI Consistency
5. **Tenant guards faltantes** (-6 pts) → Security
6. **Frontdesk view ausente** (-6 pts) → Product Flow
7. **Calendar God Component** (-5 pts) → Code Quality
8. **Accessibility limitada** (-5 pts) → Accessibility
9. **Memberships inline styles** (-4 pts) → UI Consistency
10. **Bundle no optimizado** (-4 pts) → Performance

---

## 6️⃣ KPI Coverage Map

### Métricas con Fórmulas

#### 1. Time-to-Cash
**Fórmula:** `minutos desde reserva confirmada → pago registrado/conciliado`

| Dato Requerido | Pantalla Generadora | Estado | Gap | Ticket |
|----------------|---------------------|--------|-----|--------|
| Timestamp `confirmed` | Wizard, Calendar | ⚠️ Parcial | No emite evento | FRONT-A3 |
| Timestamp `paid` | Stripe webhook, POS | ⚠️ Parcial | No registra en UI | FRONT-A4 |
| Delta calculation | Dashboard | ❌ NO EXISTE | Sin lógica | FRONT-A5 |

**Instrumentación Faltante:**
```tsx
// En wizard/page.tsx, después de confirmar
track('booking_confirmed', {
  reservationId,
  confirmedAt: Date.now(),
  clinicId: user.clinicId
});

// En POS/Stripe webhook handler
track('payment_received', {
  reservationId,
  paidAt: Date.now(),
  timeToCash: paidAt - confirmedAt
});
```

#### 2. Ocupación
**Fórmula:** `reservas confirmadas / capacidad total`

| Dato Requerido | Pantalla Generadora | Estado | Gap | Ticket |
|----------------|---------------------|--------|-----|--------|
| Reservas confirmadas | Calendar, Dashboard | ✅ Existe | - | - |
| Capacidad total (N/1) | Service config | ❌ NO EN UI | Sin pantalla | FRONT-A6 |
| Cálculo agregado | Dashboard | ⚠️ Mock data | Sin query real | FRONT-A7 |

**Gap Crítico:** No hay UI para configurar capacidad de servicios (CLASS N vs SESSION 1).

#### 3. No-show Rate
**Fórmula:** `no-shows / reservas confirmadas`

| Dato Requerido | Pantalla Generadora | Estado | Gap | Ticket |
|----------------|---------------------|--------|-----|--------|
| Marca "no-show" | Check-in flow | ❌ NO EXISTE | Sin UI | FRONT-A8 |
| Contador no-shows | Cliente profile | ❌ NO EXISTE | Sin strikes | FRONT-A9 |
| Cálculo % | Dashboard | ❌ NO EXISTE | Sin query | FRONT-A10 |

**Bloqueante:** Sin check-in/out flow, imposible marcar no-shows.

### Eventos Faltantes (para Analytics)

```typescript
// Crear lib/analytics.ts
export const trackEvent = (event: string, properties: Record<string, any>) => {
  // Enviar a backend analytics
  fetch('/api/v1/analytics/events', {
    method: 'POST',
    body: JSON.stringify({ event, properties, timestamp: Date.now() })
  });
};

// Eventos requeridos:
- booking_started
- booking_step_completed (por step)
- booking_confirmed
- payment_initiated
- payment_success
- payment_failed
- check_in_marked
- check_out_marked
- no_show_marked
- waitlist_joined
- service_capacity_updated
- credit_consumed
- credit_expired
```

---

## 7️⃣ Roadmap ABCDE + Tickets Ejecutables

### Priorización ABCDE

#### A = CRÍTICO (Bloquea Launch y Cobrar)

**FRONT-A1: Implementar Multi-Tenant Guards**
- **Descripción:** Validar `clinicId` en todos los fetches y rutas
- **Archivos:** 
  - `lib/api-client.ts` (add clinicId to all requests)
  - `app/providers.tsx` (TenantProvider)
  - `middleware.ts` (validate clinicId from token)
- **Pasos:**
  1. Crear `TenantContext` con clinicId del token
  2. Modificar `apiFetch` para incluir header `X-Clinic-ID`
  3. Agregar guard en middleware: si no hay clinicId → redirect a onboarding
  4. Crear `TenantSelectorModal` si usuario tiene múltiples clinics
- **Criterios de Aceptación:**
  - GIVEN usuario sin clinicId WHEN accede a /dashboard THEN redirect a /onboarding
  - GIVEN request a API WHEN sin X-Clinic-ID header THEN return 403
  - GIVEN usuario con clinicId válido WHEN navega THEN datos filtrados por tenant
- **Riesgo:** ALTO — Sin esto, data leakage entre tenants
- **Impacto:** Security + Multi-tenant compliance
- **Dependencias:** Backend debe validar header
- **Tiempo:** L (2-3 días)

---

**FRONT-A2: RBAC Visual Completo**
- **Descripción:** Filtrar UI por rol (sidebar, acciones, rutas)
- **Archivos:**
  - `app/components/shell/AppChrome.tsx`
  - `lib/rbac.tsx` (nuevo)
  - `app/(app)/*/layout.tsx` (add Server Component guards)
- **Pasos:**
  1. Crear `Can` component para conditional rendering
  2. Crear matriz de permisos: `PERMISSIONS[role][action][resource]`
  3. Filtrar `navItems` en AppChrome según rol
  4. Agregar Server Component guards en layouts
  5. Testear con cada rol
- **Criterios de Aceptación:**
  - GIVEN CLIENT role WHEN en AppChrome THEN solo ve "Mis Reservas", "Comprar Paquetes"
  - GIVEN THERAPIST role WHEN navega a /admin THEN redirect a /dashboard
  - GIVEN RECEPTION role WHEN en Calendar THEN puede check-in pero no delete
- **Riesgo:** ALTO — Sin esto, roles sin sentido
- **Impacto:** Security + UX + Compliance
- **Dependencias:** Token debe incluir role
- **Tiempo:** M (3-4 días)

---

**FRONT-A3: Check-in / Check-out Flow**
- **Descripción:** Pantalla operativa para marcar asistencia
- **Archivos:**
  - `app/(app)/check-in/page.tsx` (nuevo)
  - `lib/admin-api.ts` (add markCheckin, markCheckout, markNoShow)
  - `components/CheckInButton.tsx` (nuevo)
- **Pasos:**
  1. Crear ruta `/check-in` con lista de reservas de hoy
  2. Botones: "Check-in", "Complete", "No-show"
  3. Update status en backend via mutation
  4. Emitir evento analytics
  5. Mobile-optimized (frontdesk usa celular)
- **Criterios de Aceptación:**
  - GIVEN reserva CONFIRMED WHEN click "Check-in" THEN status → CHECKED_IN
  - GIVEN reserva CHECKED_IN WHEN click "Complete" THEN status → COMPLETED
  - GIVEN reserva CONFIRMED WHEN no asiste y click "No-show" THEN status → NO_SHOW
  - GIVEN no-show WHEN marcar THEN incrementar strikes en cliente
- **Riesgo:** ALTO — Core operativo
- **Impacto:** time-to-cash + operación
- **Dependencias:** Backend `/reservations/:id/check-in` endpoint
- **Tiempo:** M (2-3 días)

---

**FRONT-A4: Instrumentación de KPIs (time-to-cash)**
- **Descripción:** Eventos analytics para medir métricas de negocio
- **Archivos:**
  - `lib/analytics.ts` (nuevo)
  - `app/(app)/wizard/page.tsx` (add events)
  - `app/(app)/pos/page.tsx` (add events)
- **Pasos:**
  1. Crear helper `trackEvent(name, properties)`
  2. Agregar eventos en:
     - `booking_confirmed` (wizard)
     - `payment_received` (POS/Stripe)
     - `check_in_marked` (check-in page)
  3. Backend debe persistir en analytics table
  4. Dashboard query para calcular avg time-to-cash
- **Criterios de Aceptación:**
  - GIVEN booking confirmado WHEN evento emitido THEN timestamp guardado
  - GIVEN pago recibido WHEN evento emitido THEN delta calculado
  - GIVEN dashboard WHEN carga THEN muestra avg time-to-cash real
- **Riesgo:** ALTO — Sin métricas, no podemos medir éxito
- **Impacto:** Métricas de negocio
- **Dependencias:** Backend analytics endpoints
- **Tiempo:** S (1-2 días)

---

**FRONT-A5: Frontdesk Day Sheet**
- **Descripción:** Vista operativa "hoy" para recepción
- **Archivos:**
  - `app/(app)/frontdesk/page.tsx` (nuevo)
  - Components: `TodayTimeline`, `QuickActions`, `PendingPayments`
- **Pasos:**
  1. Lista de reservas de hoy con filtros: branch, status
  2. Quick actions: Check-in, Cobrar, Ver detalles
  3. Pending payments list
  4. Mobile-first design (uso en celular)
- **Criterios de Aceptación:**
  - GIVEN RECEPTION role WHEN abre /frontdesk THEN ve reservas de hoy
  - GIVEN reserva WHEN click "Check-in" THEN marca asistencia
  - GIVEN pago pendiente WHEN click "Cobrar" THEN abre POS flow
- **Riesgo:** ALTO — Operación diaria bloqueada
- **Impacto:** Operación + ocupación
- **Dependencias:** Ninguna
- **Tiempo:** M (2-3 días)

---

**FRONT-A6: Booking Wizard - Capacidad N (Clases)**
- **Descripción:** Wizard debe manejar clases con capacidad > 1
- **Archivos:**
  - `app/(app)/wizard/page.tsx` (refactor)
  - `lib/public-api.ts` (add getClassInstances)
- **Pasos:**
  1. En step "Servicio": mostrar badge "Clase (capacidad X)" vs "Sesión"
  2. Si es clase: mostrar lista de instancias programadas
  3. Mostrar ocupación: "8/12 lugares"
  4. Si lleno: botón "Unirse a waitlist"
  5. Validar disponibilidad antes de confirmar
- **Criterios de Aceptación:**
  - GIVEN servicio tipo CLASS WHEN selecciona THEN muestra instancias
  - GIVEN clase con 11/12 WHEN cliente reserva THEN ocupación → 12/12
  - GIVEN clase llena WHEN intenta reservar THEN muestra waitlist option
- **Riesgo:** ALTO — Clases no funcionan sin esto
- **Impacto:** Ocupación + producto core
- **Dependencias:** Backend debe retornar capacity en service
- **Tiempo:** L (3-4 días)

---

**FRONT-A7: Wallet / Credits Balance View**
- **Descripción:** Cliente ve saldo de credits y expiraciones
- **Archivos:**
  - `app/(app)/wallet/page.tsx` (nuevo)
  - `lib/admin-api.ts` (add getUserCredits, getCreditLedger)
  - Components: `CreditCard`, `LedgerTimeline`
- **Pasos:**
  1. Crear pantalla "Mi Wallet"
  2. Mostrar paquetes activos con progreso
  3. Mostrar credits disponibles + expiración
  4. Timeline de movimientos (alta, consumo, expiración)
  5. CTA: "Comprar más credits"
- **Criterios de Aceptación:**
  - GIVEN usuario con paquete WHEN abre wallet THEN ve saldo "8/10 sesiones"
  - GIVEN credits cerca de expirar WHEN ve wallet THEN banner de alerta
  - GIVEN movimiento WHEN consulta ledger THEN ve timestamp + tipo + cantidad
- **Riesgo:** ALTO — Sin esto, cliente no sabe saldo
- **Impacto:** Transparencia + UX
- **Dependencias:** Backend ledger endpoints
- **Tiempo:** M (2-3 días)

---

**FRONT-A8: Waitlist Management (Clases)**
- **Descripción:** Sistema de lista de espera para clases llenas
- **Archivos:**
  - `app/(app)/wizard/page.tsx` (add waitlist flow)
  - `app/(app)/calendar/page.tsx` (show waitlist)
  - `lib/admin-api.ts` (add joinWaitlist, getWaitlist)
- **Pasos:**
  1. Wizard: botón "Unirse a waitlist" si clase llena
  2. Calendar: badge "3 en waitlist"
  3. Admin puede ver waitlist y confirmar manualmente
  4. Auto-confirm si alguien cancela (backend)
- **Criterios de Aceptación:**
  - GIVEN clase llena WHEN cliente intenta reservar THEN join waitlist
  - GIVEN en waitlist WHEN alguien cancela THEN auto-confirm primero en lista
  - GIVEN admin WHEN ve clase THEN puede ver lista de espera
- **Riesgo:** ALTO — Feature clave para ocupación
- **Impacto:** Ocupación + revenue
- **Dependencias:** Backend waitlist logic
- **Tiempo:** M (3 días)

---

#### B = IMPORTANTE (Mejora Operación/UX, No Bloquea)

**FRONT-B1: Design System Refactor**
- **Descripción:** Unificar tokens, eliminar inline styles, consolidar componentes
- **Archivos:**
  - `src/styles/tokens.css` (crear completo)
  - `app/(app)/memberships/page.tsx` (refactor 1027 LOC)
  - Eliminar `BloomButton.tsx`, migrar a `EventoraButton`
- **Pasos:**
  1. Completar `tokens.css` con spacing, radius, typography, shadows
  2. Refactor memberships: extraer componentes `PlanCard`, `FeatureList`
  3. Unificar buttons
  4. Documentar en Storybook (opcional)
- **Criterios de Aceptación:**
  - GIVEN cualquier componente WHEN usa spacing THEN usa variables CSS
  - GIVEN memberships page WHEN rendered THEN 0 inline styles
  - GIVEN buttons WHEN rendered THEN solo usa EventoraButton variants
- **Riesgo:** MEDIO — Mejora DX y consistencia
- **Impacto:** UI Consistency + maintainability
- **Dependencias:** Ninguna
- **Tiempo:** L (4-5 días)

---

**FRONT-B2: Calendar Refactor (1304 LOC → Feature-based)**
- **Descripción:** Descomponer God Component en módulos reutilizables
- **Archivos:**
  - `features/calendar/` (nuevo)
    - `CalendarView.tsx`
    - `WeekView.tsx`, `MonthView.tsx`, `DayView.tsx`
    - `ReservationCard.tsx`
    - `useCalendar.ts` (hook)
- **Pasos:**
  1. Extraer lógica de fecha a hook `useCalendar`
  2. Crear componentes por vista
  3. Separar modal de edición
  4. Mejorar performance (memoization)
- **Criterios de Aceptación:**
  - GIVEN calendar WHEN rendered THEN <300 LOC por archivo
  - GIVEN cambio de vista WHEN switch THEN no re-fetch innecesario
- **Riesgo:** MEDIO — Mejora maintainability
- **Impacto:** Code Quality + Performance
- **Dependencias:** Ninguna
- **Tiempo:** L (5 días)

---

**FRONT-B3: Optimistic Updates (React Query)**
- **Descripción:** UX instantáneo en mutaciones críticas
- **Archivos:**
  - `lib/admin-api.ts` (refactor mutations)
  - `app/(app)/clients/page.tsx`, `calendar/page.tsx`, etc.
- **Pasos:**
  1. Implementar optimistic updates en:
     - Crear/editar cliente
     - Crear/editar reserva
     - Check-in/out
  2. Rollback en caso de error
  3. Toast notifications
- **Criterios de Aceptación:**
  - GIVEN crear cliente WHEN submit THEN aparece inmediatamente en lista
  - GIVEN error en backend WHEN ocurre THEN revierte cambio + toast error
- **Riesgo:** BAJO — UX enhancement
- **Impacto:** UX + perceived performance
- **Dependencias:** Ninguna
- **Tiempo:** M (2 días)

---

**FRONT-B4: Microinteracciones (Framer Motion)**
- **Descripción:** Animaciones sutiles iOS-like
- **Archivos:**
  - `components/ui/EventoraButton.tsx` (add whileTap)
  - `components/ui/GlowCard.tsx` (add whileHover)
  - Modales: add AnimatePresence
- **Pasos:**
  1. Buttons: scale 0.98 on tap
  2. Cards: scale 1.02 on hover
  3. Modales: fade + slide
  4. Transitions: 150-250ms
- **Criterios de Aceptación:**
  - GIVEN button WHEN pressed THEN scales down
  - GIVEN modal WHEN opens THEN fades in smoothly
  - GIVEN animations WHEN run THEN respeta prefers-reduced-motion
- **Riesgo:** BAJO — Polish
- **Impacto:** UX premium
- **Dependencias:** Ninguna
- **Tiempo:** S (1-2 días)

---

**FRONT-B5: Accessibility Audit + Fixes**
- **Descripción:** Keyboard nav, ARIA, contraste WCAG AA
- **Archivos:** Todos los componentes
- **Pasos:**
  1. Audit con Axe DevTools
  2. Focus trap en modales
  3. ARIA labels en iconos
  4. Verificar contraste (4.5:1 mínimo)
  5. Test con screen reader
- **Criterios de Aceptación:**
  - GIVEN modal WHEN abre THEN focus trap activado
  - GIVEN navegación WHEN usa Tab THEN orden lógico
  - GIVEN Axe audit WHEN run THEN 0 errores críticos
- **Riesgo:** MEDIO — Compliance + UX
- **Impacto:** Accessibility
- **Dependencias:** Ninguna
- **Tiempo:** M (3 días)

---

#### C = NICE-TO-HAVE (Impacto Moderado)

**FRONT-C1: Drag & Drop en Calendar**
- **Descripción:** Mover reservas arrastrando
- **Archivos:** `app/(app)/calendar/page.tsx`, usar `@dnd-kit/core`
- **Tiempo:** M (3 días)

**FRONT-C2: Service Configuration UI**
- **Descripción:** CRUD de servicios con capacidad, duración, precio
- **Archivos:** `app/(app)/services/page.tsx` (mejorar)
- **Tiempo:** M (3 días)

**FRONT-C3: Client Profile Enhancement**
- **Descripción:** Historial completo, notas, tags, no-show strikes
- **Archivos:** `app/(app)/clients/[id]/page.tsx` (nuevo)
- **Tiempo:** M (2-3 días)

**FRONT-C4: Notifications Center**
- **Descripción:** Centro de notificaciones in-app
- **Archivos:** `app/(app)/notifications/page.tsx` (mejorar)
- **Tiempo:** S (2 días)

---

#### D = DELEGABLE/POST-MVP

- Storybook setup
- i18n (si expande a LATAM)
- PWA offline mode
- Dark mode refinement

---

#### E = ELIMINAR/POSTERGAR

- Marketplace full (solo slug públicos por ahora)
- Admin panel avanzado (priorizar operación)
- Chat interno

---

### Release Plan (3 Sprints MVP)

#### Sprint 1: Multi-Tenant + RBAC + Check-in (CRÍTICO)
**Objetivo:** Seguridad y operación básica funcional

| Ticket | Días | Owner | Dependencias |
|--------|------|-------|--------------|
| FRONT-A1 | 3 | Frontend Lead | Backend clinic endpoints |
| FRONT-A2 | 4 | Frontend Lead | Token con role |
| FRONT-A3 | 3 | Frontend Dev 1 | Backend check-in endpoints |
| FRONT-A4 | 2 | Frontend Dev 2 | Backend analytics |
| FRONT-A5 | 3 | Frontend Dev 1 | Ninguna |

**Total:** 15 días-persona (~2 semanas con 2 devs)

**Gate de Sprint 1:**
- [ ] Multi-tenant guards funcionando
- [ ] RBAC visual completo
- [ ] Check-in/out operativo
- [ ] Frontdesk view funcional
- [ ] KPIs instrumentados

---

#### Sprint 2: Booking + Credits + Waitlist
**Objetivo:** Flows de producto core completos

| Ticket | Días | Owner | Dependencias |
|--------|------|-------|--------------|
| FRONT-A6 | 4 | Frontend Lead | Backend capacity |
| FRONT-A7 | 3 | Frontend Dev 2 | Backend ledger |
| FRONT-A8 | 3 | Frontend Dev 1 | Backend waitlist |
| FRONT-B1 | 5 | Frontend Dev 2 | Ninguna |
| FRONT-B3 | 2 | Frontend Dev 1 | Ninguna |

**Total:** 17 días-persona (~2 semanas)

**Gate de Sprint 2:**
- [ ] Wizard maneja clases (N) y sesiones (1)
- [ ] Wallet muestra credits y expiraciones
- [ ] Waitlist funcional
- [ ] Design system unificado
- [ ] Optimistic updates en actions clave

---

#### Sprint 3: Polish + Tests + Launch Readiness
**Objetivo:** Calidad premium y testing

| Ticket | Días | Owner | Dependencias |
|--------|------|-------|--------------|
| FRONT-B2 | 5 | Frontend Lead | Ninguna |
| FRONT-B4 | 2 | Frontend Dev 1 | Ninguna |
| FRONT-B5 | 3 | Frontend Dev 2 | Ninguna |
| Tests E2E | 5 | QA + Frontend | Todos los flows |
| Tests Unit | 5 | Frontend Team | Componentes críticos |

**Total:** 20 días-persona (~3 semanas)

**Gate de Sprint 3:**
- [ ] Calendar refactorizado
- [ ] Microinteracciones implementadas
- [ ] Accessibility WCAG AA
- [ ] 3 E2E críticos passing
- [ ] Cobertura unitaria 60%+

---

## 8️⃣ DECISIONS.md (Decisiones Asumidas)

### DEC-FE-001: LocalStorage vs HttpOnly Cookies para Auth
**Decisión:** Migrar a **HttpOnly Cookies** (Sprint 1)  
**Razón:** LocalStorage es vulnerable a XSS. Cookies con Secure + SameSite=Strict son más seguras.  
**Trade-off:** Requiere coordinar con backend para manejar cookies.  
**Status:** Pendiente implementación

### DEC-FE-002: Custom Components vs Radix/shadcn
**Decisión:** **Mantener custom por ahora**, pero **adoptar Radix progresivamente** (Sprint 3)  
**Razón:** Ya hay inversión en custom components. Migrar todo es costoso. Radix garantiza a11y.  
**Trade-off:** Más mantenimiento a corto plazo.  
**Status:** Custom ahora, Radix en refactor futuro

### DEC-FE-003: Multi-Tenant: Tenant Switcher vs Single Tenant por Login
**Decisión:** **Single Tenant por Login** (mayoría de usuarios solo tienen 1 clinic)  
**Razón:** Simplifica UX. 99% de usuarios no necesitan switch.  
**Trade-off:** Si alguien tiene múltiples clinics, debe logout/login.  
**Status:** Implementar tenant selector solo si necesario post-MVP

### DEC-FE-004: RBAC: Client-side Only vs Server Component Guards
**Decisión:** **Hybrid** — Server Component guards + client-side checks  
**Razón:** Server guards para seguridad real, client checks para UX (hide buttons).  
**Trade-off:** Más código, pero más robusto.  
**Status:** A implementar en Sprint 1

### DEC-FE-005: Calendar: FullCalendar vs Custom
**Decisión:** **Mantener FullCalendar** (refactorizar uso, no reemplazar)  
**Razón:** Reemplazar es costoso. FullCalendar tiene features complejas (drag, recurring).  
**Trade-off:** Bundle size +150KB, pero feature-complete.  
**Status:** Optimizar uso (lazy load, tree shake)

### DEC-FE-006: Design System: TailwindCSS vs CSS-in-JS
**Decisión:** **TailwindCSS + CSS Variables**  
**Razón:** Ya implementado, consistente con tokens.  
**Trade-off:** Utility classes pueden verbosear HTML.  
**Status:** Mantener, normalizar tokens

### DEC-FE-007: Forms: React Hook Form vs Formik
**Decisión:** **React Hook Form** (ya instalado)  
**Razón:** Mejor performance (uncontrolled), menor bundle.  
**Trade-off:** Menos features que Formik.  
**Status:** Mantener

### DEC-FE-008: Testing: Playwright vs Cypress
**Decisión:** **Playwright** (ya configurado)  
**Razón:** Más rápido, multi-browser, mejor DX.  
**Trade-off:** Menos plugins que Cypress.  
**Status:** Activar tests en Sprint 3

---

## 9️⃣ Siguientes 5 Pasos (Ejecutables Inmediatos)

### Paso 1: Setup de Tickets (Día 1)
**Acción:** Crear issues en GitHub/Jira con formato de tickets de este reporte  
**Responsable:** Product Owner + Frontend Lead  
**Output:** 8 tickets A priorizados en backlog  
**Tiempo:** 2 horas

### Paso 2: Kickoff Sprint 1 — Multi-Tenant + RBAC (Día 1)
**Acción:** Asignar FRONT-A1 y FRONT-A2 a devs, definir DoD  
**Responsable:** Frontend Lead  
**Output:** Branch `feat/multi-tenant-rbac` creado  
**Tiempo:** 1 hora

### Paso 3: Backend Coordination (Día 1-2)
**Acción:** Validar que backend tiene endpoints para:
- Clinic by ID
- Check-in/out
- Analytics events
- Waitlist
**Responsable:** Frontend Lead + Backend Lead  
**Output:** API contract confirmado  
**Tiempo:** 2 horas

### Paso 4: Design Tokens Normalization (Día 2-3)
**Acción:** Completar `src/styles/tokens.css` con sistema full  
**Responsable:** Frontend Dev 2  
**Output:** Tokens CSS completos, documentados  
**Tiempo:** 4 horas

### Paso 5: E2E Tests Setup (Día 3)
**Acción:** Configurar Playwright CI, escribir 1 test de smoke  
**Responsable:** QA + Frontend Dev 1  
**Output:** Pipeline CI con 1 E2E passing  
**Tiempo:** 4 horas

---

## 🎯 Conclusión Ejecutiva

### Veredicto Final
**Eventora frontend NO está listo para launch.** Requiere **Sprint de Remediación Crítico** (2-3 semanas) para resolver:
1. Multi-tenant guards (data leakage risk)
2. RBAC visual (security + UX)
3. Check-in/out flow (operación bloqueada)
4. KPI instrumentación (métricas inexistentes)

### Impacto en Métricas de Negocio
Sin remediación:
- **Time-to-cash:** No medible → No optimizable
- **Ocupación:** Cálculo incorrecto (no distingue N vs 1)
- **No-show rate:** Imposible rastrear (no hay check-in)

### Ruta Crítica (6 semanas)
1. **Sprint 1** (2 sem): Multi-tenant + RBAC + Check-in → Seguridad + Operación
2. **Sprint 2** (2 sem): Booking completo + Credits + Waitlist → Producto core
3. **Sprint 3** (2 sem): Polish + Tests → Calidad premium

**Post Sprint 3:** Launch viable con MVP completo.

### Health Score Proyectado Post-Remediación
- **Actual:** 42/100 🔴
- **Post Sprint 1:** 58/100 🟡
- **Post Sprint 2:** 72/100 🟢
- **Post Sprint 3:** 85/100 ✅ Launch Ready

### Commitment del Equipo
- **2 Frontend Devs full-time** (6 semanas)
- **1 QA** (últimas 2 semanas)
- **Backend Support** (endpoints ready)
- **Product Owner** (validación de flows)

---

**Documento Generado:** 19 de enero de 2026  
**Próxima Revisión:** Post Sprint 1 (Gate Review)  
**Contacto:** Frontend Lead / Product Team
