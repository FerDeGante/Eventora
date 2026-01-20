# Security Baseline — Eventora

> **Última auditoría:** 19 enero 2026  
> **Estado:** ✅ MVP ready

---

## 📊 Resumen de Estado

| Área | Estado | Notas |
|------|--------|-------|
| Multi-tenant | ✅ Implementado | clinicId en todas las tablas |
| Auth + JWT | ✅ Implementado | 2FA email, 1h expiry |
| RBAC | ✅ Implementado | 5 roles definidos |
| CORS | ✅ Habilitado | 19 ene 2026 |
| Helmet | ✅ Habilitado | CSP, XSS, etc. |
| Rate Limiting | ✅ Implementado | Auth + reservas |
| Webhooks | ✅ Verificados | Firma Stripe |

---

## Multi-tenant

### Implementación actual
- ✅ Todas las tablas incluyen `clinicId`
- ✅ Middleware Prisma en `apps/api/src/lib/prisma.ts`
- ✅ AsyncLocalStorage para contexto de tenant
- ✅ Guard en todas las queries server-side
- ✅ Nunca aceptar clinicId del cliente como fuente de verdad

### Archivos clave
```
apps/api/src/lib/prisma.ts          # Middleware multi-tenant
apps/api/src/lib/tenant-context.ts  # AsyncLocalStorage
apps/api/src/plugins/tenant.ts      # Plugin Fastify
```

### Validación
```sql
-- Verificar que todas las tablas tienen clinicId
SELECT table_name FROM information_schema.columns 
WHERE column_name = 'clinicId';
```

---

## Auth + RBAC

### Roles definidos
| Rol | Permisos |
|-----|----------|
| `ADMIN` | Acceso total, incluye billing |
| `MANAGER` | Todo excepto billing SaaS |
| `RECEPTION` | Reservas, clientes, check-in |
| `THERAPIST` | Su agenda, sus reservas |
| `CLIENT` | Sus propias reservas y perfil |

### Implementación
- ✅ JWT con `@fastify/jwt` (1h expiry)
- ✅ 2FA vía email (6 dígitos, 10 min TTL)
- ✅ Bcrypt 12 rounds para passwords
- ✅ Decorator `app.authenticate` en todos los endpoints protegidos

### Endpoints públicos (sin auth)
```
POST /auth/login
POST /auth/register
POST /auth/password/request
POST /auth/password/reset
POST /auth/two-factor/verify
GET  /api/v1/onboarding/plans
GET  /api/v1/catalog/services (público para booking)
GET  /api/v1/availability
POST /api/v1/payments/checkout
POST /api/v1/reservations (booking público)
```

---

## Input Validation

### Zod schemas
- ✅ Validación server-side en todas las mutaciones
- ✅ Schemas en `*.schema.ts` por módulo
- ✅ Sanitización de inputs que se renderizan

### Ejemplo
```typescript
// apps/api/src/modules/reservations/reservation.schema.ts
export const createReservationInput = z.object({
  serviceId: z.string().min(1),
  branchId: z.string().min(1),
  startAt: z.string().datetime(),
  // ...
});
```

---

## Webhooks

### Stripe (✅ Implementado)
- ✅ Verificación de firma (`stripe.webhooks.constructEvent`)
- ✅ Idempotencia (eventId procesado)
- ✅ Logs de eventos
- ✅ Manejo de errores

### Eventos manejados
```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
account.updated (Connect)
payment_intent.succeeded
```

### Archivo clave
```
apps/api/src/routes/webhooks/stripe.routes.ts
```

---

## Rate Limiting

### Implementación
- ✅ Upstash Redis como backend
- ✅ Fallback a memoria si Redis no disponible

### Límites configurados
| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/auth/login` | 5 | 60s |
| `/auth/register` | 5 | 60s |
| `/auth/password/request` | 3 | 60s |
| `POST /reservations` | 10 | 60s |

### Archivo clave
```
apps/api/src/lib/rate-limit.ts
```

---

## Headers de Seguridad

### CORS (✅ Habilitado 19 ene)
```typescript
// apps/api/src/plugins/security.ts
app.register(cors, {
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Clinic-Id"],
});
```

### Helmet (✅ Habilitado 19 ene)
```typescript
app.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === "production",
});
```

---

## Logging

### Principios
- ✅ Sin secretos en logs
- ✅ Sin PII sensible (emails truncados, IDs hasheados)
- ✅ Structured logging con Pino
- ✅ Sentry para errores

### Qué NO loggear
- Passwords (nunca)
- Tokens completos (solo últimos 4 chars)
- Números de tarjeta
- Datos médicos sensibles

---

## Checklist Pre-Producción

### ⚠️ Pendiente (Acción del usuario)
- [ ] Regenerar credenciales Supabase
- [ ] Cambiar `JWT_SECRET` (min 64 chars)
- [ ] Configurar Stripe API keys reales
- [ ] Configurar Resend API key real
- [ ] Revisar variables de entorno en `.env`
- [ ] Habilitar RLS policies en PostgreSQL (opcional, defense-in-depth)

### Variables sensibles
```bash
DATABASE_URL=          # Supabase connection string
JWT_SECRET=            # Mínimo 64 caracteres, aleatorio
STRIPE_SECRET_KEY=     # sk_live_...
STRIPE_WEBHOOK_SECRET= # whsec_...
RESEND_API_KEY=        # re_...
```

---

## Auditorías Realizadas

| Fecha | Tipo | Resultado |
|-------|------|-----------|
| 19 ene 2026 | Auditoría exhaustiva | Gaps críticos cerrados |
| - | CORS/Helmet | Habilitados |
| - | POST /users | Protegido con auth |
| - | Notification templates | Protegidos con auth |
| - | Rate limit reservas | Implementado |

---

*Documento mantenido por equipo de seguridad Eventora.*
