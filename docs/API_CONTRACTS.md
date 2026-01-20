# API Contracts — Eventora

> Contratos de API para integración frontend ↔ backend  
> Última actualización: 2026-01-19

---

## Base URL

| Entorno | URL |
|---------|-----|
| Development | `http://localhost:4000` |
| Production | `https://api.eventora.com` |

---

## Autenticación

Todas las rutas protegidas requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

El token expira en 1 hora. Usar `/auth/refresh` para renovar.

---

## Módulos y Endpoints

### 🔐 Auth (`/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Login con email/password | No |
| POST | `/auth/verify-2fa` | Verificar código 2FA | No |
| POST | `/auth/forgot-password` | Solicitar reset password | No |
| POST | `/auth/reset-password` | Cambiar password | No |
| GET | `/auth/me` | Obtener usuario actual | Sí |
| POST | `/auth/refresh` | Renovar token | Sí |

**POST /auth/register**
```typescript
// Request
{
  email: string;
  password: string;
  name: string;
  clinicName?: string;
}

// Response 201
{
  user: { id, email, name };
  token: string;
}
```

**POST /auth/login**
```typescript
// Request
{ email: string; password: string; }

// Response 200 (sin 2FA)
{ user: {...}; token: string; }

// Response 200 (con 2FA)
{ requires2FA: true; tempToken: string; }
```

---

### 🏥 Clinics (`/clinics`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/clinics` | Listar clínicas (admin) | SUPERADMIN |
| GET | `/clinics/:id` | Obtener clínica | Sí |
| POST | `/clinics` | Crear clínica | SUPERADMIN |
| PATCH | `/clinics/:id` | Actualizar clínica | OWNER |
| DELETE | `/clinics/:id` | Eliminar clínica | SUPERADMIN |
| POST | `/clinics/:id/logo` | Subir logo | OWNER |

**GET /clinics/:id**
```typescript
// Response 200
{
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  settings: {
    timezone: string;
    currency: string;
    cancellationPolicy: string;
  };
  branches: Branch[];
}
```

---

### 📍 Branches (`/branches`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/branches` | Listar sucursales | Sí |
| GET | `/branches/:id` | Obtener sucursal | Sí |
| POST | `/branches` | Crear sucursal | ADMIN |
| PATCH | `/branches/:id` | Actualizar sucursal | ADMIN |
| DELETE | `/branches/:id` | Eliminar sucursal | ADMIN |

---

### 📦 Catalog (`/catalog`)

#### Categories
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/catalog/categories` | Listar categorías | Sí |
| POST | `/catalog/categories` | Crear categoría | ADMIN |
| PATCH | `/catalog/categories/:id` | Actualizar | ADMIN |
| DELETE | `/catalog/categories/:id` | Eliminar | ADMIN |

#### Services
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/catalog/services` | Listar servicios | Sí |
| GET | `/catalog/services/:id` | Obtener servicio | Sí |
| POST | `/catalog/services` | Crear servicio | ADMIN |
| PATCH | `/catalog/services/:id` | Actualizar | ADMIN |
| DELETE | `/catalog/services/:id` | Eliminar | ADMIN |

**GET /catalog/services**
```typescript
// Query params
{
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Response 200
{
  data: Service[];
  meta: { total, page, limit, totalPages };
}
```

**Service Schema**
```typescript
{
  id: string;
  name: string;
  description: string | null;
  duration: number; // minutos
  price: number; // centavos
  isActive: boolean;
  categoryId: string;
  category: Category;
}
```

---

### 👥 Clients (`/clients`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/clients` | Listar clientes | Sí |
| GET | `/clients/:id` | Obtener cliente | Sí |
| POST | `/clients` | Crear cliente | Sí |
| PATCH | `/clients/:id` | Actualizar cliente | Sí |
| DELETE | `/clients/:id` | Eliminar cliente | ADMIN |
| GET | `/clients/:id/reservations` | Historial de citas | Sí |
| GET | `/clients/:id/packages` | Paquetes del cliente | Sí |

**Client Schema**
```typescript
{
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  _count: {
    reservations: number;
    packages: number;
  };
}
```

---

### 👨‍⚕️ Therapists (`/therapists`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/therapists` | Listar terapeutas | Sí |
| GET | `/therapists/:id` | Obtener terapeuta | Sí |
| POST | `/therapists` | Crear terapeuta | ADMIN |
| PATCH | `/therapists/:id` | Actualizar | ADMIN |
| DELETE | `/therapists/:id` | Eliminar | ADMIN |
| GET | `/therapists/:id/schedule` | Horario semanal | Sí |
| PUT | `/therapists/:id/schedule` | Guardar horario | ADMIN |

---

### 📅 Availability (`/availability`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/availability` | Slots disponibles | Público |

**GET /availability**
```typescript
// Query params (requeridos)
{
  serviceId: string;
  therapistId: string;
  date: string; // YYYY-MM-DD
  branchId?: string;
}

// Response 200
{
  date: string;
  slots: Array<{
    time: string; // HH:mm
    available: boolean;
  }>;
}
```

---

### 📆 Reservations (`/reservations`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/reservations` | Listar reservaciones | Sí |
| GET | `/reservations/:id` | Obtener reservación | Sí |
| POST | `/reservations` | Crear reservación | Sí |
| PATCH | `/reservations/:id` | Actualizar estado | Sí |
| DELETE | `/reservations/:id` | Cancelar | Sí |

**Reservation Status Enum**
```typescript
enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}
```

**POST /reservations**
```typescript
// Request
{
  clientId: string;
  therapistId: string;
  serviceId: string;
  branchId: string;
  startTime: string; // ISO 8601
  notes?: string;
  paymentMethod?: 'STRIPE' | 'MERCADOPAGO' | 'CASH' | 'PACKAGE';
  packageId?: string; // Si paga con paquete
}

// Response 201
{
  reservation: Reservation;
  payment?: {
    checkoutUrl?: string; // Para Stripe/MP
  };
}
```

---

### 💳 Payments (`/payments`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/payments` | Listar pagos | Sí |
| GET | `/payments/:id` | Obtener pago | Sí |
| POST | `/payments/checkout` | Crear sesión Stripe | Sí |
| POST | `/payments/webhook` | Webhook Stripe | No* |

*El webhook usa firma de Stripe para autenticación.

**POST /payments/checkout**
```typescript
// Request
{
  reservationId: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Response 200
{
  checkoutUrl: string;
  sessionId: string;
}
```

---

### 🎁 Packages (`/packages`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/packages` | Listar paquetes | Sí |
| GET | `/packages/templates` | Templates de paquetes | Sí |
| POST | `/packages/templates` | Crear template | ADMIN |
| POST | `/packages` | Asignar a cliente | Sí |
| GET | `/packages/:id` | Obtener paquete | Sí |
| GET | `/packages/:id/sessions` | Sesiones del paquete | Sí |
| POST | `/packages/:id/consume` | Consumir sesión | Sí |

**Package Schema**
```typescript
{
  id: string;
  clientId: string;
  templateId: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  expiresAt: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED';
}
```

---

### 📊 Dashboard (`/dashboard`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/dashboard/stats` | Estadísticas generales | Sí |
| GET | `/dashboard/timeline` | Timeline de citas | Sí |
| GET | `/dashboard/revenue` | Ingresos por período | ADMIN |

**GET /dashboard/stats**
```typescript
// Response 200
{
  today: {
    reservations: number;
    revenue: number;
    newClients: number;
  };
  week: {
    reservations: number;
    revenue: number;
  };
  month: {
    reservations: number;
    revenue: number;
  };
}
```

---

### 📆 Calendar (`/calendar`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/calendar/events` | Eventos del calendario | Sí |
| POST | `/calendar/sync` | Sincronizar Google Cal | Sí |

---

## Respuestas de Error

Todas las respuestas de error siguen el formato:

```typescript
{
  statusCode: number;
  error: string;
  message: string;
}
```

### Códigos Comunes

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token faltante/inválido |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Recurso ya existe |
| 422 | Unprocessable - Validación fallida |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

---

## Rate Limiting

| Ruta | Límite |
|------|--------|
| `/auth/login` | 5 req/min |
| `/auth/register` | 3 req/min |
| `/auth/forgot-password` | 3 req/hora |
| General | 100 req/min |

---

## Paginación

Endpoints que devuelven listas soportan:

```typescript
// Query params
{
  page?: number;    // default: 1
  limit?: number;   // default: 20, max: 100
}

// Response meta
{
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## Multi-tenancy

Todas las operaciones están aisladas por `clinicId`. El tenant se infiere del JWT del usuario autenticado. No es necesario enviar `clinicId` manualmente.

---

*Para ejemplos de request/response completos, ver `/apps/api/src/docs/schemas.example.ts`*
