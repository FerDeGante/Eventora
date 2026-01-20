# Environment Variables — Eventora

> **Archivo:** `.env` (no versionado)  
> **Template:** `.env.example`

---

## ⚠️ Acción Requerida Pre-Producción

Los siguientes valores DEBEN ser reemplazados antes del lanzamiento:

| Variable | Estado | Acción |
|----------|--------|--------|
| `DATABASE_URL` | 🔴 Placeholder | Regenerar en Supabase |
| `JWT_SECRET` | 🔴 Placeholder | Generar nuevo (64+ chars) |
| `STRIPE_SECRET_KEY` | 🔴 Placeholder | Obtener de Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | 🔴 Placeholder | Configurar webhook |
| `RESEND_API_KEY` | 🔴 Placeholder | Obtener de Resend |
| `MERCADOPAGO_ACCESS_TOKEN` | 🟡 Opcional | Si se usa MP |

---

## Variables por Servicio

### Database (Supabase)
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Pooler para producción
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Authentication
```bash
# Mínimo 64 caracteres, aleatorio
JWT_SECRET="your-super-secret-jwt-key-min-64-characters-long-replace-this"

# Opcional: tiempo de expiración
JWT_EXPIRES_IN="1h"
```

### Stripe
```bash
# API Keys (usar live keys en producción)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Webhook secret (desde Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Connect (opcional)
STRIPE_CONNECT_CLIENT_ID="ca_..."
```

### Resend (Email)
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Eventora <noreply@eventora.com>"
```

### MercadoPago (Opcional)
```bash
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
```

### Upstash Redis (Rate Limiting)
```bash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Sentry (Error Tracking)
```bash
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."
```

### Google Calendar (Opcional)
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

---

## Variables por Entorno

### Development
```bash
NODE_ENV="development"
API_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Production
```bash
NODE_ENV="production"
API_URL="https://api.eventora.com"
NEXT_PUBLIC_API_URL="https://api.eventora.com"
```

---

## Generar Secrets

```bash
# JWT Secret (64 caracteres)
openssl rand -base64 48

# Alternativamente
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Validación

El backend valida variables requeridas al iniciar:

```typescript
// apps/api/src/lib/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  // ...
});
```

Si falta alguna variable, el servidor no inicia.

---

## .env.example

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventora"

# Auth
JWT_SECRET="replace-this-with-64-character-minimum-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Rate Limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Monitoring
SENTRY_DSN=""
```

---

*Nunca commitear `.env` al repositorio. Usar `.env.example` como referencia.*
