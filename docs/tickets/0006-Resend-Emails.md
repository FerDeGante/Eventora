# T-0006 — Resend Emails

## Contexto
- **Problema:** Necesitamos comunicar confirmaciones y recordatorios
- **Por qué importa (KPI):** No-show rate (recordatorios reducen no-shows)
- **Usuarios afectados:** CLIENT, ADMIN

## Alcance
### Incluye
- Email de confirmación de reserva
- Email de recordatorio (24h, 1h)
- Email de cancelación
- Templates editables
- Logs de envío

### No incluye
- SMS (Twilio) — Post-MVP
- Push notifications — Post-MVP
- WhatsApp avanzado

## Criterios de aceptación
1. ✅ Confirmación se envía al crear reserva
2. ✅ Recordatorio 24h antes funciona
3. ✅ Admin puede editar templates
4. ✅ Logs de envío visibles

## Plan
- [x] Integración Resend
- [x] Template confirmación
- [x] Template recordatorio
- [x] CRUD NotificationTemplate
- [x] Endpoint POST /notifications/send
- [x] UI de templates

## Implementación

### Files touched
- `apps/api/src/lib/resend.ts`
- `apps/api/src/modules/notifications/*`
- `apps/web/src/app/(app)/notifications/page.tsx`

### Test evidence
- Manual: Crear reserva → email recibido
- Manual: Editar template → cambios reflejados

### Security checks
- [x] Templates protegidos con auth (19 ene 2026)
- [x] No exponer API key
- [x] Sanitizar contenido HTML

### UX checks
- [x] Lista de templates clara
- [x] Editor de template funcional
- [x] Preview de email
- [x] Feedback al guardar

## Status
- **Estado:** ✅ DONE
- **Owner:** Notifications module
- **Fecha:** 19 enero 2026
