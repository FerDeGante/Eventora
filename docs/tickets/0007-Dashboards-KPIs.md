# T-0007 — Dashboards & KPIs

## Contexto
- **Problema:** Admin necesita ver métricas de negocio
- **Por qué importa (KPI):** Todos — visibilidad para tomar decisiones
- **Usuarios afectados:** ADMIN, MANAGER

## Alcance
### Incluye
- Dashboard principal con KPIs
- Ingresos (hoy, mes, crecimiento)
- Reservas (hoy, semana, pendientes)
- Timeline del día
- Paquetes activos

### No incluye
- Reportes exportables (Post-MVP)
- Analytics avanzados
- Filtros por rango de fechas (pendiente)

## Criterios de aceptación
1. ✅ Dashboard muestra ingresos del día
2. ✅ Dashboard muestra reservas del día
3. ✅ Timeline muestra próximas citas
4. ✅ Datos se refrescan automáticamente

## Plan
- [x] Endpoint GET /dashboard/overview
- [x] Endpoint GET /dashboard/kpis
- [x] UI Dashboard con cards
- [x] Gráficas con Recharts
- [x] Timeline del día

## Implementación

### Files touched
- `apps/api/src/modules/dashboard/*`
- `apps/web/src/app/(app)/dashboard/page.tsx`
- `apps/web/src/lib/admin-api.ts`

### Test evidence
- Manual: Dashboard carga con datos reales
- Manual: KPIs calculados correctamente

### Security checks
- [x] Solo usuarios autenticados
- [x] Datos filtrados por clinicId
- [x] No exponer datos de otros tenants

### UX checks
- [x] Cards claras con métricas
- [x] Loading states
- [x] Fallback si no hay datos
- [ ] Filtro por fechas (pendiente)

## Status
- **Estado:** ✅ DONE (90%)
- **Pendiente:** Filtro por rango de fechas, métricas por sucursal
- **Owner:** Dashboard module
- **Fecha:** Enero 2026
