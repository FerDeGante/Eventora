# Bloom - Recovery Playbook 🚨

## Guía Rápida de Respuesta ante Incidentes

**Objetivo:** Proveer procedimientos paso a paso para recuperación ante diferentes escenarios de fallo.

---

## 🎯 Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **SEV-1** | Sistema completamente caído | < 15 min | Immediate (CEO, CTO) |
| **SEV-2** | Funcionalidad crítica degradada | < 1 hora | DevOps Lead |
| **SEV-3** | Funcionalidad no crítica afectada | < 4 horas | On-call team |
| **SEV-4** | Issue menor, no urgente | < 24 horas | Normal ticket |

---

## 📋 Incident Response Checklist

```markdown
### Incident Response Flow

1. [ ] **DETECT:** Sistema de monitoreo detecta anomalía
2. [ ] **ASSESS:** Evaluar severity level (SEV-1 a SEV-4)
3. [ ] **NOTIFY:** Alertar equipo según severity
4. [ ] **MITIGATE:** Activar modo mantenimiento si es necesario
5. [ ] **INVESTIGATE:** Identificar causa raíz
6. [ ] **RECOVER:** Ejecutar procedimiento correspondiente
7. [ ] **VALIDATE:** Verificar que servicio está OK
8. [ ] **COMMUNICATE:** Actualizar status page y usuarios
9. [ ] **POST-MORTEM:** Documentar incidente y lecciones
```

---

## 🔴 SEV-1: Database Unavailable

### Síntomas
- App no puede conectar a Neon
- Error: `ECONNREFUSED` o `timeout`
- Todas las requests fallan con 500

### Diagnosis Rápida
```bash
# 1. Verificar conexión a Neon
psql $DATABASE_URL -c "SELECT 1;"

# 2. Check Neon status
curl https://status.neon.tech/api/v2/status.json

# 3. Revisar logs de conexión
npx prisma studio # Si abre, DB OK; si falla, problema de conexión
```

### Recovery Procedure

#### Opción A: Neon está UP pero no conecta
```bash
# 1. Verificar DATABASE_URL
echo $DATABASE_URL
# Debe tener formato: postgresql://user:pass@ep-xxx.neon.tech:5432/neondb?sslmode=require

# 2. Verificar pooler (puerto 6543 vs 5432)
# Cambiar a pooler si direct connection falla
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech:6543/neondb?sslmode=require"

# 3. Verificar límites de conexiones (Free plan: 100)
# Neon Console > Usage > Current connections
# Si está en límite, esperar o upgradear plan

# 4. Restart de servicios
# Netlify/Vercel: Redeploy
# Docker: docker compose restart api
```

**RTO:** < 15 minutos  
**Escalate if:** No resuelto en 15 min → Neon Support

#### Opción B: Neon está DOWN
```bash
# 1. INMEDIATO: Activar página de mantenimiento
# Netlify: Deploy mantenimiento.html

# 2. Notificar en status page
echo "Database provider (Neon) experiencing issues" > status.txt

# 3. Monitor Neon status
watch -n 30 'curl -s https://status.neon.tech/api/v2/status.json | jq .status'

# 4. Si outage > 30min, considerar failover a backup DB
# Ver "Disaster Recovery" abajo
```

**RTO:** Depende de Neon (usualmente < 1 hora)  
**Escalate immediately:** CTO, considerar migration a backup provider

---

## 🟠 SEV-2: Data Loss / Accidental Deletion

### Síntomas
- Usuario reporta datos faltantes
- Reservaciones, clientes o pagos borrados
- Timestamp conocido del incidente

### Diagnosis Rápida
```bash
# 1. Confirmar con usuario qué datos faltan
# 2. Identificar tabla afectada
# 3. Determinar timestamp aproximado
```

### Recovery Procedure: PITR (Neon)

```bash
# PASO 1: Login a Neon Console
open https://console.neon.tech

# PASO 2: Create branch from history
# Dashboard > Branches > Create Branch
# - Source: main
# - From: History (Point in Time)
# - Timestamp: [5 minutos ANTES del incidente]

# PASO 3: Conectar a branch temporal
TEMP_DB="postgresql://user:pass@br-temp-123.neon.tech:5432/neondb"

# PASO 4: Exportar datos específicos
pg_dump $TEMP_DB \
  -t reservations \
  -t clients \
  --data-only \
  --inserts \
  > recovery_$(date +%Y%m%d_%H%M%S).sql

# PASO 5: Revisar SQL antes de importar
less recovery_*.sql

# PASO 6: Importar a producción
psql $DATABASE_URL < recovery_*.sql

# PASO 7: Validar con usuario
# "¿Están sus datos ahora?"

# PASO 8: Eliminar branch temporal
# Neon Console > Branches > [temp branch] > Delete
```

**RTO:** < 30 minutos  
**RPO:** < 5 minutos (granularidad de PITR)

---

## 🟡 SEV-2: Database Corruption

### Síntomas
- Foreign key violations
- Unique constraint errors
- Inconsistencias de datos

### Diagnosis Rápida
```bash
# 1. Verificar integridad referencial
npx prisma db execute --sql "
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'f';
"

# 2. Buscar registros huérfanos
npx prisma db execute --sql "
-- Reservations sin client
SELECT COUNT(*) FROM reservations r
LEFT JOIN clients c ON r.clientId = c.id
WHERE c.id IS NULL;
"
```

### Recovery Procedure

```bash
# OPCIÓN A: Corrupción menor (fix con SQL)
# 1. Crear backup preventivo
./scripts/db-backup.sh

# 2. Fix específico
npx prisma db execute --sql "
-- Ejemplo: eliminar reservations huérfanas
DELETE FROM reservations
WHERE clientId NOT IN (SELECT id FROM clients);
"

# 3. Validar
npx prisma validate

# OPCIÓN B: Corrupción severa (restore desde backup)
# 1. Activar modo mantenimiento
echo "⚠️ Mantenimiento en progreso" > public/maintenance.html

# 2. Crear snapshot forense
./scripts/db-backup.sh

# 3. Identificar último backup válido
ls -lh backups/ | tail -10

# 4. Restaurar
./scripts/db-restore.sh backups/bloom_backup_20251203_020000.sql.gz

# 5. Aplicar migraciones
npx prisma migrate deploy

# 6. Validar integridad
npm run db:validate

# 7. Desactivar mantenimiento
rm public/maintenance.html
```

**RTO:** < 2 horas  
**RPO:** Último backup (máx 24h si diario)

---

## 🔵 SEV-3: Migration Failure

### Síntomas
- `prisma migrate deploy` falla
- Error en CI/CD pipeline
- Schema drift detectado

### Diagnosis Rápida
```bash
# 1. Ver status de migraciones
npx prisma migrate status

# 2. Revisar logs de última migración
cat .prisma/migration-logs/*.log | tail -50
```

### Recovery Procedure

```bash
# PASO 1: Backup inmediato
./scripts/db-backup.sh

# PASO 2: Resolver migration
# Opción A: Migration incompleta
npx prisma migrate resolve --applied [migration_name]

# Opción B: Migration bloqueada
npx prisma migrate resolve --rolled-back [migration_name]

# PASO 3: Re-intentar deploy
npx prisma migrate deploy

# PASO 4: Si persiste, rollback manual
# Conectar a DB y revertir cambios
psql $DATABASE_URL < prisma/migrations/[previous]/migration.sql

# PASO 5: Marcar como resolved
npx prisma migrate resolve --rolled-back [failed_migration]

# PASO 6: Fix migration file y re-aplicar
```

**RTO:** < 1 hora  
**Prevention:** Siempre testear migrations en staging primero

---

## 🟢 SEV-4: Performance Degradation

### Síntomas
- Queries lentos (> 2s)
- Timeout en API
- High CPU en DB

### Diagnosis Rápida
```bash
# 1. Ver queries lentos
npx prisma db execute --sql "
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"

# 2. Ver conexiones activas
npx prisma db execute --sql "
SELECT count(*) FROM pg_stat_activity;
"

# 3. Ver índices faltantes
npx prisma db execute --sql "
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE n_distinct > 100 AND correlation < 0.1;
"
```

### Recovery Procedure

```bash
# 1. Identificar query problemático
# Ver logs de API en Netlify/Vercel

# 2. Agregar índice si es necesario
npx prisma migrate dev --name add_index_to_reservations_date

# En migration.sql:
# CREATE INDEX idx_reservations_date ON reservations(date);

# 3. Analizar tabla
npx prisma db execute --sql "ANALYZE reservations;"

# 4. Si es problema de conexiones, aumentar pooler
# Neon Console > Settings > Connection pooling
# Max connections: 100 → 200 (Pro plan)

# 5. Implementar caching
# Redis para queries frecuentes
```

**RTO:** < 4 horas  
**Prevention:** Query analysis en PR reviews

---

## 💥 Disaster Recovery: Failover a Nueva DB

### Cuándo usar
- Neon completamente inaccesible > 2 horas
- Corrupción irrecuperable
- Migración forzada de provider

### Full Procedure

```bash
# === FASE 1: PREPARACIÓN ===

# 1. Notificar a todos
# Slack #general: "⚠️ DISASTER RECOVERY EN PROGRESO"
# Status page: "Performing emergency database migration"

# 2. Activar página de mantenimiento
# Deploy static page con ETA

# 3. Crear incident log
echo "Incident started: $(date)" > incident_$(date +%Y%m%d).log

# === FASE 2: PROVISIONAR NUEVA DB ===

# Opción A: Nueva branch en Neon (si Neon OK pero branch corrupta)
# Neon Console > Create Branch > From latest backup

# Opción B: AWS RDS PostgreSQL 15
aws rds create-db-instance \
  --db-instance-identifier bloom-prod-emergency \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username bloom_admin \
  --master-user-password [SECURE_PASSWORD] \
  --allocated-storage 100 \
  --backup-retention-period 7 \
  --no-publicly-accessible

# Esperar ~10 minutos por provisioning

# === FASE 3: RESTAURAR DATOS ===

# 1. Obtener último backup de S3
aws s3 cp s3://bloom-backups/production/latest.sql.gz .

# 2. Descomprimir
gunzip latest.sql.gz

# 3. Restaurar
psql -h new-db.us-east-1.rds.amazonaws.com \
     -U bloom_admin \
     -d bloom_prod < latest.sql

# 4. Aplicar migraciones pendientes (si las hay)
DATABASE_URL="postgresql://bloom_admin:pass@new-db/bloom_prod" \
  npx prisma migrate deploy

# === FASE 4: ACTUALIZAR CONFIGURACIÓN ===

# 1. Actualizar DATABASE_URL en todos los ambientes
# Netlify Dashboard > Site settings > Environment variables
NEW_DB_URL="postgresql://bloom_admin:pass@new-db.us-east-1.rds.amazonaws.com:5432/bloom_prod"

# 2. Redeploy todos los servicios
# Netlify: Trigger redeploy
# Vercel: Trigger redeploy
# Docker: Update .env y restart

# 3. Actualizar .env.example y documentación

# === FASE 5: VALIDACIÓN ===

# 1. Smoke tests
curl https://bloom.com/api/health
# Expected: {"status": "ok", "db": "connected"}

# 2. Verificar data integrity
npx prisma db execute --sql "
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM reservations) as reservations_count,
  (SELECT COUNT(*) FROM clinics) as clinics_count;
"

# Comparar con snapshot pre-incidente

# 3. Test funcional completo
# - Login
# - Crear reserva
# - Procesar pago
# - Generar reporte

# === FASE 6: COMUNICACIÓN ===

# 1. Desactivar mantenimiento
# 2. Status page: "All systems operational"
# 3. Email a usuarios: "Service restored"
# 4. Post-mortem meeting (within 48h)

# === FASE 7: CLEANUP ===

# 1. Mantener DB antigua por 7 días (forensics)
# 2. Monitorear nueva DB intensivamente (24h)
# 3. Actualizar runbooks con lecciones
# 4. Documentar costos incurridos
```

**RTO:** < 4 horas  
**RPO:** Último backup (máx 24h)  
**Cost:** $50-200 (DB temporal por semana)

---

## 🧪 Recovery Drills (Quarterly)

### Q1 2025 Drill Schedule

**Drill 1: PITR Recovery (Enero 15)**
```markdown
Scenario: Simular borrado accidental de 50 reservations
Steps:
1. Crear 50 reservations de test
2. Borrar manualmente
3. Recuperar vía PITR
4. Validar que las 50 reaparecen

Expected RTO: < 30 min
Pass Criteria: 100% de registros recuperados
```

**Drill 2: Backup Restoration (Febrero 15)**
```markdown
Scenario: Simular corrupción de DB en staging
Steps:
1. Tomar backup de staging
2. Corromper datos (DELETE random rows)
3. Restaurar desde backup
4. Validar integridad

Expected RTO: < 1 hora
Pass Criteria: Schema + datos OK
```

**Drill 3: Disaster Recovery (Marzo 15)**
```markdown
Scenario: Failover completo a nueva DB
Steps:
1. Provisionar RDS temporal
2. Restaurar último backup
3. Switch DATABASE_URL
4. Validar app funcional
5. Cleanup

Expected RTO: < 4 horas
Pass Criteria: App 100% funcional en nueva DB
```

---

## 📞 Escalation Matrix

| Severity | First Responder | Escalate After | Escalate To |
|----------|----------------|----------------|-------------|
| SEV-1    | On-call DevOps | 15 minutes     | CTO + CEO   |
| SEV-2    | On-call DevOps | 1 hour         | DevOps Lead |
| SEV-3    | On-call DevOps | 4 hours        | Team Lead   |
| SEV-4    | Any Developer  | 24 hours       | Tech Lead   |

**Contact List:**
- On-call DevOps: +52-XXX-XXX-XXXX (PagerDuty)
- DevOps Lead: devops-lead@bloom.com
- CTO: cto@bloom.com
- Neon Support: support@neon.tech (Pro plan)

---

## 📊 Post-Incident Template

```markdown
# Incident Post-Mortem: [TITLE]

**Date:** YYYY-MM-DD
**Severity:** SEV-X
**Duration:** X hours
**Affected Users:** X%

## Timeline
- HH:MM - Incident detected
- HH:MM - Team notified
- HH:MM - Mitigation started
- HH:MM - Service restored
- HH:MM - Post-mortem completed

## Root Cause
[Descripción técnica de qué falló]

## Impact
- Users affected: X
- Revenue impact: $X
- Data loss: Yes/No

## What Went Well
- [ ] Detection time was quick
- [ ] Communication was clear
- [ ] Recovery procedure worked

## What Went Wrong
- [ ] Monitoring didn't catch it early
- [ ] Documentation was incomplete
- [ ] Escalation was slow

## Action Items
- [ ] [Owner] - Fix root cause (Due: YYYY-MM-DD)
- [ ] [Owner] - Update monitoring (Due: YYYY-MM-DD)
- [ ] [Owner] - Update runbook (Due: YYYY-MM-DD)

**Sign-off:** [CTO Name]
```

---

## 🎓 Training & Readiness

**Required Training:**
- [ ] All engineers: Read this playbook (Quarterly)
- [ ] DevOps: Hands-on drill (Quarterly)
- [ ] On-call rotation: Shadow experienced responder (1 shift)

**Readiness Checklist:**
- [ ] Backups funcionando y testeados
- [ ] DATABASE_URL en secrets manager
- [ ] Status page configurado
- [ ] PagerDuty integrado
- [ ] Post-mortem template ready
- [ ] Escalation matrix actualizada

---

**Última actualización:** 3 de diciembre de 2025  
**Próxima revisión:** 3 de marzo de 2026  
**Versión:** 1.0
