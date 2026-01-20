# QA Checklist — Eventora

> Pre-launch quality assurance para release del 24 de enero 2026  
> Última actualización: 2026-01-19

---

## ✅ Verificación de Seguridad

### Autenticación
- [x] Passwords hasheados con bcrypt (12 rounds)
- [x] JWT con expiración de 1h
- [x] 2FA por email funcional
- [x] Rate limiting en `/auth/*`
- [x] Logout invalida sesión (frontend)
- [ ] Refresh token rotation implementado

### Autorización
- [x] RBAC middleware funcionando
- [x] Roles: SUPERADMIN, OWNER, ADMIN, THERAPIST, RECEPTIONIST
- [x] Endpoints protegidos por rol
- [ ] Audit log de acciones sensibles

### Multi-tenancy
- [x] `clinicId` en todas las tablas
- [x] Prisma middleware filtra por tenant
- [x] AsyncLocalStorage para contexto
- [x] RLS adicional en Supabase
- [ ] Test de aislamiento cross-tenant

### Headers de Seguridad
- [x] Helmet.js habilitado
- [x] CORS restringido a dominios conocidos
- [x] CSP configurado
- [x] X-Frame-Options: DENY

---

## ✅ Funcionalidad Core

### Catálogo
- [x] CRUD categorías
- [x] CRUD servicios
- [x] Precios en centavos
- [x] Duración en minutos
- [ ] Imágenes de servicios (S3)

### Clientes
- [x] CRUD clientes
- [x] Historial de citas
- [x] Paquetes asignados
- [x] Búsqueda por nombre/email
- [ ] Importación CSV

### Terapeutas
- [x] CRUD terapeutas
- [x] Horario semanal
- [x] Asignación a sucursales
- [x] Servicios que ofrecen
- [ ] Foto de perfil

### Disponibilidad
- [x] Cálculo de slots disponibles
- [x] Respeta horario del terapeuta
- [x] Evita colisiones
- [x] Bloqueos manuales
- [ ] Feriados configurables

### Reservaciones
- [x] Crear reservación
- [x] Estados: PENDING → CONFIRMED → COMPLETED
- [x] Cancelación con validación
- [x] Email de confirmación
- [x] Recordatorio automático
- [ ] Lista de espera

### Pagos
- [x] Stripe Checkout funcional
- [x] Webhook procesa pagos
- [x] MercadoPago integrado
- [x] Pagos en efectivo/POS
- [x] Pago con paquete prepagado
- [ ] Facturación automática

### Paquetes
- [x] Templates de paquetes
- [x] Asignación a clientes
- [x] Consumo de sesiones
- [x] Expiración automática
- [ ] Renovación de paquetes

---

## ✅ Integración Frontend

### React Query v5
- [x] Migración completa a v5
- [x] Error boundaries
- [x] Loading states
- [x] Cache invalidation

### Componentes UI
- [x] Button con variantes
- [x] Form inputs validados
- [x] Modales accesibles
- [x] Toasts para feedback
- [x] Skeleton loaders

### Navegación
- [x] Rutas protegidas
- [x] Redirect post-login
- [x] 404 page
- [ ] Breadcrumbs

---

## ✅ Performance

### Backend
- [x] Indexes en queries frecuentes
- [x] Prisma select optimization
- [ ] Redis cache para dashboard
- [ ] Query analysis con EXPLAIN

### Frontend
- [x] Next.js App Router
- [x] Image optimization
- [x] Code splitting
- [ ] Bundle analysis
- [ ] Core Web Vitals check

### Database
- [x] Connection pooling (Supabase)
- [x] Migrations versionadas
- [ ] Backup automático configurado
- [ ] Read replicas (si necesario)

---

## ✅ Observabilidad

### Logging
- [x] Pino logger configurado
- [x] Request ID tracking
- [x] Error logging estructurado
- [ ] Log aggregation (CloudWatch/Datadog)

### Monitoring
- [x] Sentry configurado
- [x] Source maps subidos
- [ ] Uptime monitoring
- [ ] Alertas configuradas

### Métricas
- [ ] Response time p50/p95
- [ ] Error rate
- [ ] Active users
- [ ] Revenue tracking

---

## ✅ Testing

### Unit Tests
- [x] Vitest configurado
- [x] Auth module tests
- [ ] Availability logic tests
- [ ] Payment processing tests
- [ ] Coverage > 70%

### Integration Tests
- [x] API tests con supertest
- [ ] Database transaction rollback
- [ ] Webhook simulation

### E2E Tests
- [x] Playwright configurado
- [x] Login flow
- [x] Booking flow
- [ ] Payment flow
- [ ] Admin flows

### Manual Testing
- [ ] Happy path completo
- [ ] Edge cases documentados
- [ ] Mobile responsive check
- [ ] Cross-browser (Chrome, Safari, Firefox)

---

## ✅ Deployment

### Infraestructura
- [x] Docker Compose configurado
- [x] Dockerfiles optimizados
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment
- [ ] Production environment

### Variables de Entorno
- [ ] Production secrets en vault
- [ ] Stripe live keys configurados
- [ ] DNS configurado
- [ ] SSL certificates

### Database
- [ ] Production database creada
- [ ] Initial seed ejecutado
- [ ] Backup policy activa
- [ ] Point-in-time recovery

---

## ✅ Documentación

- [x] README actualizado
- [x] ARCHITECTURE.md
- [x] API_CONTRACTS.md
- [x] ENVIRONMENT.md
- [x] SECURITY.md
- [ ] User guide
- [ ] Admin guide
- [ ] Video walkthrough

---

## Pre-Launch Checklist Final

### D-2 (22 enero)
- [ ] Freeze de features
- [ ] Full regression test
- [ ] Load test básico
- [ ] Backup strategy verificada

### D-1 (23 enero)
- [ ] Production deploy
- [ ] Smoke tests
- [ ] DNS propagation
- [ ] Monitoring activo

### D-0 (24 enero)
- [ ] War room listo
- [ ] Rollback plan claro
- [ ] On-call definido
- [ ] Launch! 🚀

---

## Notas de Riesgo

| Riesgo | Mitigación | Estado |
|--------|------------|--------|
| Rate limit insuficiente | Upstash con fallback local | ✅ Mitigado |
| Cross-tenant leak | Prisma middleware + RLS | ✅ Mitigado |
| Payment webhook fail | Retry + idempotency | ⚠️ Verificar |
| High traffic spike | Auto-scaling + CDN | ⏳ Pendiente |

---

*Mantener actualizado hasta D-0*
