# Data Model — Eventora

> **ORM:** Prisma 6.2  
> **Database:** PostgreSQL 15 (Supabase)  
> **Schema:** `/prisma/schema.prisma`

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Modelos | 34 |
| Enums | 17 |
| Líneas | ~960 |
| Multi-tenant | ✅ clinicId en todas las tablas |

---

## Modelos Core

### Tenancy
```prisma
model Clinic {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  stripeAccountId   String?   // Stripe Connect
  chargesEnabled    Boolean   @default(false)
  // ... más campos
}

model Branch {
  id        String  @id @default(cuid())
  clinicId  String
  name      String
  city      String?
  timezone  String  @default("America/Mexico_City")
}
```

### Users & Auth
```prisma
model User {
  id                 String    @id @default(cuid())
  clinicId           String
  email              String
  passwordHash       String
  role               UserRole
  twoFactorEnabled   Boolean   @default(false)
  twoFactorSecret    String?
  // ...
}

enum UserRole {
  ADMIN
  MANAGER
  RECEPTION
  THERAPIST
  CLIENT
}
```

### Catalog
```prisma
model Service {
  id              String   @id @default(cuid())
  clinicId        String
  name            String
  duration        Int      // minutos
  price           Decimal
  categoryId      String?
}

model Package {
  id              String   @id @default(cuid())
  clinicId        String
  name            String
  sessions        Int
  price           Decimal
  validDays       Int
  status          PackageStatus
}
```

### Reservations
```prisma
model Reservation {
  id          String            @id @default(cuid())
  clinicId    String
  userId      String
  serviceId   String
  branchId    String
  therapistId String?
  startAt     DateTime
  endAt       DateTime
  status      ReservationStatus
  notes       String?
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Payments
```prisma
model PaymentIntent {
  id              String         @id @default(cuid())
  clinicId        String
  userId          String
  reservationId   String?
  amount          Int            // centavos
  currency        String
  status          PaymentStatus
  provider        PaymentProvider
  stripeId        String?
  mercadoPagoId   String?
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentProvider {
  STRIPE
  MERCADOPAGO
  CASH
  TERMINAL
}
```

### Memberships
```prisma
model Membership {
  id          String          @id @default(cuid())
  clinicId    String
  name        String
  type        MembershipType
  price       Decimal
  billingCycle BillingCycle
  sessions    Int?
  // ...
}

enum MembershipType {
  UNLIMITED
  SESSIONS_TOTAL
  SESSIONS_PERIOD
  TIME_BASED
}

model UserMembership {
  id            String   @id @default(cuid())
  clinicId      String
  userId        String
  membershipId  String
  status        MembershipStatus
  sessionsUsed  Int      @default(0)
  expiresAt     DateTime?
}
```

### Availability
```prisma
model AvailabilityTemplate {
  id          String   @id @default(cuid())
  clinicId    String
  branchId    String
  dayOfWeek   Int      // 0-6
  startTime   String   // "09:00"
  endTime     String   // "18:00"
  therapistId String?
}

model AvailabilityException {
  id          String   @id @default(cuid())
  clinicId    String
  date        DateTime
  isBlocked   Boolean
  reason      String?
}
```

---

## Relaciones Clave

```
Clinic 1:N Branch
Clinic 1:N User
Clinic 1:N Service
Clinic 1:N Reservation
Clinic 1:N Payment

User 1:N Reservation (como cliente)
User 1:N UserPackage
User 1:N UserMembership

Service 1:N Reservation
Branch 1:N Reservation
```

---

## Índices Importantes

```prisma
@@unique([clinicId, email])     // User
@@unique([clinicId, name])      // Service, Branch
@@index([clinicId, startAt])    // Reservation
@@index([clinicId, status])     // Reservation, Payment
```

---

## Convenciones

| Convención | Ejemplo |
|------------|---------|
| IDs | CUID (`cuid()`) |
| Timestamps | `createdAt`, `updatedAt` con `@updatedAt` |
| Soft delete | No implementado (delete real) |
| Moneda | Centavos (Int) |
| Timezone | UTC en DB, conversión en app |

---

## Migraciones

```bash
# Crear migración
npx prisma migrate dev --name add_feature

# Aplicar en producción
npx prisma migrate deploy

# Reset completo (desarrollo)
./scripts/db-reset.sh
```

---

## Seeds

```bash
# Ejecutar seeds
npx prisma db seed

# Archivo: prisma/seed.ts
```

---

*Ver schema completo en `/prisma/schema.prisma`*
