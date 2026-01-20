# Auditoría Frontend - Eventora
**Fecha:** 19 de enero de 2026  
**Scope:** Next.js 16, React 19, TypeScript, TailwindCSS  
**Objetivo:** Identificar brechas contra README.md y mejores prácticas

---

## 1. Resumen Ejecutivo

### Estado General: 🟡 FUNCIONAL CON GAPS CRÍTICOS

El frontend de Eventora tiene una base sólida con Next.js 16 y React 19, pero presenta gaps importantes en:
- **UX/UI inconsistente** (no cumple estándar "Apple-like" definido)
- **Accesibilidad limitada** (ARIA, keyboard nav incompletos)
- **Gestión de estado** (React Query bien usado, pero falta optimización)
- **Performance** (sin lazy loading, code splitting limitado)
- **Testing** (sin tests E2E funcionando, sin tests unitarios)
- **RBAC visual** (guards en backend, pero UI no adapta dinámicamente)

---

## 2. Arquitectura y Estructura

### ✅ Fortalezas

1. **Next.js 16 App Router**
   - Uso correcto de `app/` directory
   - Route groups: `(app)`, `(auth)` bien organizados
   - Server Components donde aplica

2. **TypeScript**
   - Tipado presente en la mayoría del código
   - Interfaces para API responses

3. **React Query v5**
   - Bien implementado para data fetching
   - Cache management básico funcional
   - Mutations con invalidación

4. **Estructura de carpetas**
   ```
   app/
     (app)/       ← Rutas protegidas
     (auth)/      ← Login, Register
     api/         ← Route handlers
     components/  ← Compartidos
     hooks/       ← Custom hooks
     lib/         ← Utils, API clients
   ```

### ❌ Gaps Críticos

1. **Sin lazy loading de componentes pesados**
   - FullCalendar, Charts no lazy
   - Bundle inicial grande

2. **Sin code splitting por rol**
   - Admin y Client cargan mismo bundle
   - Oportunidad de optimización por RBAC

3. **Mixing de patrones**
   - Algunos componentes en `components/`
   - Otros en `app/components/`
   - Inconsistencia organizacional

4. **Sin barrel exports**
   - Imports largos y redundantes
   - Dificulta refactors

### 🟡 Mejoras Recomendadas

1. **Feature-based structure**
   ```
   app/
     features/
       bookings/
         components/
         hooks/
         api/
       clients/
       payments/
   ```

2. **Lazy loading estratégico**
   ```tsx
   const Calendar = dynamic(() => import('./Calendar'), { ssr: false })
   const AdminPanel = dynamic(() => import('./AdminPanel'))
   ```

3. **Barrel exports**
   ```ts
   // app/components/index.ts
   export * from './GlowCard'
   export * from './EventoraButton'
   ```

---

## 3. UX/UI - Cumplimiento de Estándar "Apple-like"

### README Requirement:
> Minimalista, elegante, consistente. Glass/blur sutil, sombras suaves, spacing generoso. Microinteracciones 150–250ms, skeletons, estados vacíos útiles.

### ❌ Gaps Críticos

1. **Inconsistencia visual**
   - Mezcla de estilos: algunos componentes con glass effect, otros planos
   - No hay design system documentado
   - Botones: `EventoraButton`, `BloomButton`, buttons nativos mezclados

2. **Estados vacíos pobres**
   - Clientes: Solo texto "Cargando clientes..." (SIN spinner)
   - Reportes: "Cargando..." sin feedback visual
   - No hay ilustraciones o íconos descriptivos

3. **Sin microinteracciones**
   - Clicks no tienen feedback visual
   - Hover states limitados
   - No hay animaciones de transición
   - Loading states austeros

4. **Accesibilidad deficiente**
   - `skip-to-main` presente pero no probado
   - ARIA labels inconsistentes
   - Focus management pobre
   - Contraste no verificado (WCAG)
   - Keyboard navigation incompleto

5. **Mobile responsiveness reactivo, no diseñado**
   - Usa breakpoints pero no optimizado para mobile-first
   - Frontdesk debe ser operable desde celular (requirement)

### ✅ Lo que está bien

1. **Glass panels implementados**
   - `.glass-panel` clase presente
   - Backdrop blur en modales

2. **GlowCard component**
   - Efecto glow sutil implementado
   - Consistente donde se usa

3. **Spacing generoso**
   - Padding y margins amplios en general

### 🔧 Plan de Remediación

#### Corto plazo (Sprint actual)
1. **Crear design system documentado**
   - Tokens en CSS variables (`design-tokens.css` ya existe)
   - Documentar componentes base
   - Unificar buttons (eliminar BloomButton)

2. **Mejorar estados de carga**
   ```tsx
   <div className="loading-state">
     <Spinner />
     <p>Cargando clientes...</p>
   </div>
   ```

3. **Estados vacíos útiles**
   ```tsx
   <EmptyState
     icon={<Users size={64} />}
     title="No hay clientes aún"
     description="Comienza agregando tu primer cliente"
     action={<Button onClick={openModal}>Agregar cliente</Button>}
   />
   ```

4. **Microinteracciones básicas**
   - Hover scale: `transform: scale(1.02)`
   - Button press: `transform: scale(0.98)`
   - Transition: `150-250ms ease-out`

#### Mediano plazo
5. **Storybook para design system**
6. **Accessibility audit con Axe**
7. **Mobile-first redesign de Frontdesk**

---

## 4. Autenticación y RBAC

### ✅ Fortalezas

1. **Custom AuthProvider** (`useAuth` hook)
   - Context API para estado global
   - Persist en localStorage
   - Token en headers

2. **ProtectedRoute component**
   - Guards básicos implementados

3. **Roles en backend**
   - API respeta RBAC

### ❌ Gaps Críticos

1. **UI no adapta por rol**
   - Todos ven mismo sidebar
   - Opciones no se ocultan según rol
   - Ejemplo: CLIENT ve "Invite Staff"

2. **Sin 2FA UI**
   - README menciona "JWT + 2FA email"
   - No hay flow de 2FA en frontend

3. **Session management frágil**
   - localStorage puede desincronizarse
   - No refresca token automáticamente
   - No maneja expiración de sesión

4. **Sin remember me / logout everywhere**

### 🔧 Remediación

1. **RBAC visual**
   ```tsx
   <Can do="manage" on="staff">
     <MenuItem>Invite Staff</MenuItem>
   </Can>
   ```

2. **2FA flow**
   - Email code verification
   - Backup codes
   - Remember device 30 days

3. **Token refresh automático**
   - Interceptor en axios
   - Refresh antes de expiry

4. **Session devtools**
   - Debug panel en dev mode
   - Ver claims del token

---

## 5. Gestión de Estado

### ✅ Fortalezas

1. **React Query para server state**
   - Query keys bien estructuradas
   - Invalidación en mutations

2. **URL como source of truth**
   - Wizard usa `useSearchParams`
   - Filtros en URL

### ❌ Gaps

1. **Sin optimistic updates**
   - Mutations esperan response
   - UX lenta en acciones rápidas

2. **Sin error boundaries**
   - Errores crashean toda la app
   - No hay fallback UI

3. **Fetch on render**
   - No prefetch en hover
   - No parallel queries optimizadas

### 🔧 Mejoras

1. **Optimistic updates**
   ```tsx
   useMutation({
     mutationFn: updateClient,
     onMutate: async (newClient) => {
       await queryClient.cancelQueries(['clients'])
       const prev = queryClient.getQueryData(['clients'])
       queryClient.setQueryData(['clients'], old => [...old, newClient])
       return { prev }
     },
     onError: (err, variables, context) => {
       queryClient.setQueryData(['clients'], context.prev)
     }
   })
   ```

2. **Error boundaries**
   ```tsx
   <ErrorBoundary FallbackComponent={ErrorFallback}>
     <ClientsPage />
   </ErrorBoundary>
   ```

3. **Prefetch on hover**
   ```tsx
   onMouseEnter={() => queryClient.prefetchQuery(['client', id])}
   ```

---

## 6. Performance

### Métricas Actuales (estimadas)
- **FCP:** ~2.5s (Target: <1.8s)
- **LCP:** ~3.5s (Target: <2.5s)
- **CLS:** ~0.1 (Bueno: <0.1)
- **TTI:** ~4s (Target: <3.5s)

### ❌ Problemas Identificados

1. **Bundle size grande**
   - FullCalendar completo (~150KB)
   - Chart.js + react-chartjs-2 (~80KB)
   - No tree shaking de íconos (react-feather completo)

2. **Sin image optimization**
   - Imágenes no usan Next.js `<Image>`
   - No lazy loading de imágenes
   - Sin responsive images

3. **Waterfalls de requests**
   - Dashboard hace 5+ requests secuenciales
   - No parallel fetching

4. **No memoization**
   - Renders innecesarios
   - Cálculos pesados sin `useMemo`

### 🔧 Optimizaciones

1. **Code splitting**
   ```tsx
   const AdminDashboard = dynamic(() => import('./AdminDashboard'))
   const TherapistDashboard = dynamic(() => import('./TherapistDashboard'))
   ```

2. **Icon tree shaking**
   ```tsx
   // Antes
   import { Users, Calendar } from 'react-feather'
   // Después
   import Users from 'react-feather/dist/icons/users'
   ```

3. **Parallel fetching**
   ```tsx
   const [stats, timeline, webhooks] = await Promise.all([
     getStats(),
     getTimeline(),
     getWebhooks()
   ])
   ```

4. **Memoization estratégica**
   ```tsx
   const sortedClients = useMemo(
     () => clients.sort((a, b) => a.name.localeCompare(b.name)),
     [clients]
   )
   ```

---

## 7. API Integration

### ✅ Fortalezas

1. **Centralized API client** (`lib/api-client.ts`)
2. **Type-safe responses**
3. **Error handling básico**

### ❌ Gaps

1. **Sin retry logic**
   - Falla en primer error
   - No retry exponential backoff

2. **Sin request deduplication**
   - Misma query múltiples veces

3. **Sin caching HTTP**
   - No usa headers de cache

4. **Errores genéricos**
   - No distingue 401 vs 403 vs 500

### 🔧 Mejoras

1. **Retry con backoff**
   ```ts
   const retryFetch = async (url, options, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url, options)
       } catch (err) {
         if (i === retries - 1) throw err
         await sleep(2 ** i * 1000)
       }
     }
   }
   ```

2. **Request deduplication**
   - React Query ya lo hace bien
   - Confirmar `staleTime` configurado

3. **Error classification**
   ```ts
   class APIError extends Error {
     constructor(public status: number, message: string) {
       super(message)
     }
   }
   ```

---

## 8. Testing

### ❌ Estado Actual: CRÍTICO

1. **Sin tests unitarios**
   - 0 tests de componentes
   - 0 tests de hooks
   - 0 tests de utils

2. **E2E con Playwright configurado pero no usado**
   - `playwright.config.ts` existe
   - 0 test files en `e2e/`

3. **Sin testing library setup**
   - No hay `@testing-library/react`
   - No hay Jest/Vitest config para components

### 🔧 Plan de Testing

#### Fase 1: Setup (1 sprint)
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom vitest @vitejs/plugin-react
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts']
  }
})
```

#### Fase 2: Tests Críticos
1. **Auth flow**
   ```ts
   describe('Login', () => {
     it('should login with valid credentials', async () => {
       // ...
     })
   })
   ```

2. **Booking wizard**
   - Step navigation
   - Form validation
   - Checkout flow

3. **Components base**
   - GlowCard
   - EventoraButton
   - InputField

#### Fase 3: E2E
```ts
// e2e/booking-flow.spec.ts
test('complete booking flow', async ({ page }) => {
  await page.goto('/wizard')
  await page.click('[data-testid="branch-select"]')
  // ...
  await expect(page.locator('.success-message')).toBeVisible()
})
```

---

## 9. Accesibilidad (A11y)

### README Requirement:
> Accesibilidad real (teclado, aria, contraste)

### ❌ Gaps Críticos

1. **Keyboard navigation**
   - Modales no trapan focus
   - No se puede navegar sin mouse
   - Tab order incorrecto

2. **ARIA labels**
   - Botones solo con íconos sin `aria-label`
   - Forms sin `aria-describedby`
   - Error messages no anunciados

3. **Contraste**
   - No verificado contra WCAG AA (4.5:1)
   - Texto muted puede ser ilegible

4. **Screen reader**
   - No probado con NVDA/JAWS
   - Alerts no usan `role="alert"`
   - Live regions no configuradas

### 🔧 Remediación

1. **Focus trap en modales**
   ```tsx
   import FocusTrap from 'focus-trap-react'
   
   <FocusTrap>
     <Modal>...</Modal>
   </FocusTrap>
   ```

2. **ARIA completo**
   ```tsx
   <button aria-label="Cerrar modal">
     <X />
   </button>
   ```

3. **Verificar contraste**
   - Usar herramienta: https://webaim.org/resources/contrastchecker/
   - Mínimo 4.5:1 para texto normal
   - Mínimo 3:1 para texto grande

4. **Testing con screen reader**
   - NVDA (Windows)
   - VoiceOver (Mac)
   - Documentar flujos críticos

---

## 10. Security

### ✅ Fortalezas

1. **HTTPS enforced**
2. **Token en headers** (no en URL)
3. **CORS configurado**

### ❌ Gaps

1. **LocalStorage para tokens**
   - Vulnerable a XSS
   - Preferible httpOnly cookies

2. **Sin CSP headers**
   - No hay Content-Security-Policy

3. **Sin rate limiting visible**
   - API debe tener, pero UI no muestra

4. **Passwords en clear en forms**
   - No hay validación de fuerza
   - No hay generador de passwords

### 🔧 Mejoras

1. **HttpOnly cookies**
   ```ts
   // Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict
   ```

2. **CSP headers**
   ```ts
   // next.config.mjs
   headers: async () => [{
     source: '/(.*)',
     headers: [{
       key: 'Content-Security-Policy',
       value: "default-src 'self'; ..."
     }]
   }]
   ```

3. **Password strength meter**
   ```tsx
   <PasswordInput
     onChange={validateStrength}
     strength={strength}
   />
   ```

---

## 11. Observability

### ✅ Implementado

1. **Sentry configurado**
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`

2. **Custom `useUxMetrics` hook**
   - Tracking de eventos

### ❌ Gaps

1. **Sin Web Vitals tracking**
   - No reporta FCP, LCP, CLS

2. **Sin error tracking granular**
   - No contexto de usuario en errores

3. **Sin performance marks**
   - No profiling de renders

### 🔧 Mejoras

1. **Web Vitals**
   ```tsx
   import { getCLS, getFID, getFCP } from 'web-vitals'
   
   getCLS(console.log)
   getFID(console.log)
   getFCP(console.log)
   ```

2. **Sentry context**
   ```ts
   Sentry.setUser({
     id: user.id,
     email: user.email,
     role: user.role
   })
   ```

3. **Performance marks**
   ```ts
   performance.mark('wizard-start')
   // ...
   performance.mark('wizard-complete')
   performance.measure('wizard-flow', 'wizard-start', 'wizard-complete')
   ```

---

## 12. Internacionalización (i18n)

### ❌ No Implementado

- Toda la app hardcoded en español
- No hay archivos de traducción
- No hay soporte para múltiples idiomas

### 🟡 Recomendación

Si MVP es solo México, OK.  
Si escala a LATAM, implementar:

```tsx
import { useTranslation } from 'next-intl'

const { t } = useTranslation()
<h1>{t('welcome')}</h1>
```

---

## 13. PWA y Mobile

### ✅ Implementado

1. **manifest.json** configurado
2. **Service Worker registration**
3. **Apple Web App meta tags**
4. **Icons para iOS/Android**

### ❌ Gaps

1. **Service Worker vacío**
   - No cachea assets
   - No offline support

2. **Sin push notifications**
   - Capability presente pero no usado

3. **Sin install prompt**
   - No invita a "Add to Home Screen"

### 🔧 Mejoras

1. **Workbox para caching**
   ```js
   // service-worker.js
   import { precacheAndRoute } from 'workbox-precaching'
   precacheAndRoute(self.__WB_MANIFEST)
   ```

2. **Install prompt**
   ```tsx
   const [deferredPrompt, setDeferredPrompt] = useState(null)
   
   useEffect(() => {
     window.addEventListener('beforeinstallprompt', (e) => {
       e.preventDefault()
       setDeferredPrompt(e)
     })
   }, [])
   ```

---

## 14. Priorización de Remediación

### 🔴 P0 (Bloqueantes para Launch)

1. **Testing básico** (E2E de flows críticos)
2. **RBAC visual** (UI adapta por rol)
3. **Estados de error/vacío mejorados**
4. **Accesibilidad keyboard navigation**
5. **Security: HttpOnly cookies**

### 🟡 P1 (Calidad para Launch)

6. **Design system documentado**
7. **Performance: code splitting**
8. **Error boundaries**
9. **Microinteracciones básicas**
10. **Optimistic updates**

### 🟢 P2 (Post-Launch)

11. **Testing unitario completo**
12. **Web Vitals tracking**
13. **PWA offline support**
14. **i18n si escala**

---

## 15. Checklist de Definition of Done (Frontend)

Contra README DoD:

- [ ] **Reserva y pago end-to-end** → ✅ Flow existe, PERO sin tests E2E
- [ ] **Check-in/out funcional** → 🟡 UI existe, falta testing
- [ ] **Credits/membresías** → 🟡 Backend OK, UI básica
- [ ] **Emails transaccionales** → ✅ Backend, UI solo muestra logs
- [ ] **Dashboards con KPIs** → 🟡 Existen pero loading states pobres
- [ ] **Multi-tenant + RBAC** → 🟡 Backend ✅, Frontend no adapta UI
- [ ] **Manejo de errores** → ❌ Sin error boundaries, errores genéricos
- [ ] **UI consistente** → ❌ Design system no documentado, inconsistencias
- [ ] **Accesible** → ❌ Keyboard nav incompleto, ARIA limitado
- [ ] **Setup reproducible** → ✅ README OK

### Score: 4.5/10 ❌

---

## 16. Roadmap de Remediación (3 Sprints)

### Sprint 1: Fundación (P0)
**Objetivo:** Lanzar con calidad mínima

1. **Semana 1: Testing + RBAC**
   - Setup Playwright E2E
   - Tests de booking flow
   - RBAC visual básico (`<Can>` component)

2. **Semana 2: UX/UI crítico**
   - Estados vacíos con ilustraciones
   - Loading spinners consistentes
   - Error boundaries

### Sprint 2: Calidad (P1)
**Objetivo:** Experiencia premium

3. **Semana 3: Design System**
   - Documentar componentes base
   - Unificar buttons
   - Microinteracciones

4. **Semana 4: Performance**
   - Code splitting por rol
   - Image optimization
   - Lazy loading

### Sprint 3: Excelencia (P2)
**Objetivo:** Best-in-class

5. **Semana 5: Testing completo**
   - Unit tests de componentes
   - Cobertura 70%+

6. **Semana 6: Observability**
   - Web Vitals tracking
   - Performance profiling

---

## 17. Recomendaciones Finales

### Arquitectura
1. ✅ **Mantener:** Next.js 16 App Router, React Query, TypeScript
2. 🔧 **Mejorar:** Estructura de carpetas (feature-based), lazy loading
3. 🆕 **Agregar:** Error boundaries, testing setup

### UX/UI
1. ✅ **Mantener:** Glass effects donde están
2. 🔧 **Mejorar:** Consistencia, estados vacíos, microinteracciones
3. 🆕 **Agregar:** Design system, accesibilidad completa

### Performance
1. 🔧 **Optimizar:** Bundle size (code splitting, tree shaking)
2. 🆕 **Agregar:** Memoization, prefetching, parallel queries

### Testing
1. 🆕 **Crear todo:** Actualmente 0 tests

### Seguridad
1. 🔧 **Cambiar:** LocalStorage → HttpOnly cookies
2. 🆕 **Agregar:** CSP headers, password strength

---

## 18. Conclusión

El frontend de Eventora tiene **fundamentos sólidos** (Next.js 16, React Query, TypeScript), pero presenta **gaps críticos en UX/UI, testing y accesibilidad** que impiden cumplir el estándar "Apple-like" prometido en el README.

### Veredicto:
**🟡 LANZABLE con remediación de P0 (Sprint 1)**

Con el plan de 3 sprints, Eventora alcanzará calidad premium y cumplirá todos los DoD del README.

---

**Próximos pasos:**
1. Revisar esta auditoría con el equipo
2. Priorizar tickets de P0
3. Iniciar Sprint 1 de remediación
