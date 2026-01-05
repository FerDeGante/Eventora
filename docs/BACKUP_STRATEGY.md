# Bloom - Backup Strategy & Disaster Recovery

## 📋 Resumen Ejecutivo

Este documento define la estrategia de backups, retención de datos y procedimientos de recuperación ante desastres para Bloom.

**Última actualización:** 3 de diciembre de 2025  
**Responsable:** DevOps Team  
**Criticidad:** HIGH - Datos de salud y transacciones

---

## 🎯 Objetivos de Recovery

### Recovery Time Objective (RTO)
- **Crítico:** < 1 hora (base de datos principal)
- **Alto:** < 4 horas (funcionalidad completa)
- **Medio:** < 24 horas (reportes históricos)

### Recovery Point Objective (RPO)
- **Producción:** < 5 minutos (PITR)
- **Staging:** < 1 hora
- **Desarrollo:** < 1 día

---

## 🗄️ Estrategia de Backup

### 1. Neon PostgreSQL - Point-in-Time Recovery (PITR)

**Configuración Actual:**
- Provider: Neon (Serverless PostgreSQL)
- Database: `neondb`
- Connection: Pooler (puerto 6543) + Direct (puerto 5432)

**PITR Habilitado:**
✅ Neon automáticamente mantiene backups continuos
✅ Recovery point disponible: últimos 7 días (plan gratuito) / 30 días (plan Pro)
✅ Granularidad: punto específico en el tiempo (minuto exacto)

#### Configuración en Neon Dashboard

**Paso 1: Verificar PITR**
```
1. Login: https://console.neon.tech
2. Seleccionar proyecto: Bloom
3. Settings > Point-in-Time Recovery
4. Verificar: "Enabled" ✅
5. Retention: 7 days (Free) / 30 days (Pro)
```

**Paso 2: Configurar Retention (Plan Pro)**
```sql
-- Retention automático manejado por Neon
-- Para retention mayor a 30 días, exportar backups externos
```

**Paso 3: Test de Restauración (Mensual)**
```
1. Neon Dashboard > Branches
2. Create branch from history
3. Seleccionar timestamp específico
4. Conectar app a branch temporal
5. Validar datos
6. Eliminar branch temporal
```

---

### 2. Backups Manuales con Scripts

**Script disponible:** `scripts/db-backup.sh`

**Frecuencia recomendada:**
- **Producción:** Diario (2:00 AM UTC)
- **Staging:** Semanal (Domingos)
- **Desarrollo:** On-demand

**Configuración Cron (Producción):**
```bash
# Agregar a crontab del servidor
0 2 * * * /path/to/bloom/scripts/db-backup.sh >> /var/log/bloom/backup.log 2>&1

# Limpiar backups antiguos (retener 30 días)
0 3 * * * find /path/to/bloom/backups -name "*.sql.gz" -mtime +30 -delete
```

**Ubicación de Backups:**
```
Local:      ./backups/bloom_backup_YYYYMMDD_HHMMSS.sql.gz
S3:         s3://bloom-backups/production/YYYY/MM/bloom_backup_YYYYMMDD_HHMMSS.sql.gz
Retention:  30 días (local), 1 año (S3)
```

---

### 3. Backup a S3 (Recomendado para Producción)

**Script de sincronización:**
```bash
#!/bin/bash
# scripts/sync-backups-to-s3.sh

BACKUP_DIR="./backups"
S3_BUCKET="s3://bloom-backups/production"
YEAR=$(date +"%Y")
MONTH=$(date +"%m")

# Sincronizar backups del día a S3
aws s3 sync $BACKUP_DIR $S3_BUCKET/$YEAR/$MONTH/ \
  --exclude "*" \
  --include "bloom_backup_$(date +%Y%m%d)*.sql.gz" \
  --storage-class STANDARD_IA

echo "✅ Backups sincronizados a S3"
```

**Configuración de Lifecycle en S3:**
```json
{
  "Rules": [
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

---

## 🔄 Procedimientos de Recuperación

### Escenario 1: Recuperación de datos borrados accidentalmente

**Síntomas:**
- Usuario reporta datos faltantes
- Borrado accidental de registros
- Timestamp conocido del incidente

**Procedimiento:**
```bash
# 1. Identificar timestamp del incidente
INCIDENT_TIME="2025-12-03 14:30:00"

# 2. Crear branch desde PITR en Neon
# Neon Dashboard > Branches > New Branch > From History
# Seleccionar timestamp antes del incidente

# 3. Conectar a la branch temporal
DATABASE_URL_TEMP="postgresql://user:pass@temp-branch.neon.tech/neondb"

# 4. Exportar datos específicos
pg_dump -h temp-branch.neon.tech -U user -d neondb \
  -t reservations -t clients \
  --data-only > recovery_data.sql

# 5. Importar a producción
psql $DATABASE_URL < recovery_data.sql

# 6. Validar con usuario

# 7. Eliminar branch temporal
```

**RTO:** < 30 minutos  
**RPO:** < 5 minutos (PITR granularidad)

---

### Escenario 2: Corrupción de base de datos

**Síntomas:**
- Errores de integridad en queries
- Tablas inconsistentes
- Foreign key violations

**Procedimiento:**
```bash
# 1. INMEDIATO: Activar modo mantenimiento
# Detener writes, solo read-only

# 2. Crear snapshot del estado actual (forense)
./scripts/db-backup.sh

# 3. Identificar último backup válido
ls -lh backups/ | tail -20

# 4. Restaurar desde backup
./scripts/db-restore.sh bloom_backup_20251203_020000.sql.gz

# 5. Aplicar migraciones si es necesario
npx prisma migrate deploy

# 6. Validar integridad
npx prisma db execute --sql "
  SELECT COUNT(*) FROM information_schema.tables;
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM reservations;
"

# 7. Desactivar modo mantenimiento
```

**RTO:** < 2 horas  
**RPO:** Último backup (máx 24h si es diario)

---

### Escenario 3: Desastre total (pérdida de Neon)

**Síntomas:**
- Neon no disponible
- Pérdida total de datos
- Falla catastrófica del proveedor

**Procedimiento:**
```bash
# 1. Provisionar nueva base de datos
# Opción A: Nueva instancia en Neon
# Opción B: AWS RDS PostgreSQL
# Opción C: DigitalOcean Managed PostgreSQL

# 2. Obtener último backup de S3
aws s3 cp s3://bloom-backups/production/2025/12/bloom_backup_20251203_020000.sql.gz .

# 3. Descomprimir
gunzip bloom_backup_20251203_020000.sql.gz

# 4. Restaurar a nueva DB
psql -h new-db-host.com -U bloom -d bloom_prod < bloom_backup_20251203_020000.sql

# 5. Actualizar DATABASE_URL en todos los servicios
# Netlify, Vercel, env vars, etc.

# 6. Aplicar migraciones pendientes
npx prisma migrate deploy

# 7. Validar y activar
```

**RTO:** < 4 horas  
**RPO:** Último backup en S3 (máx 24h)

---

## 📊 Retention Policies

| Tipo de Backup | Frecuencia | Retention Local | Retention S3 | Storage Class |
|----------------|------------|-----------------|--------------|---------------|
| PITR (Neon)    | Continuo   | 7-30 días       | N/A          | N/A           |
| Manual Diario  | Diario     | 30 días         | 90 días      | Standard IA   |
| Manual Semanal | Semanal    | 60 días         | 365 días     | Glacier       |
| Pre-Migration  | On-demand  | Permanente      | 3 años       | Glacier Deep  |

---

## 🧪 Testing de Recovery (Quarterly)

**Checklist trimestral:**
```markdown
### Q1 2025 - Recovery Drill

- [ ] Test 1: PITR recovery (borrado accidental)
  - Timestamp: _______
  - Duración: _______
  - Resultado: PASS / FAIL
  - Notas: _______

- [ ] Test 2: Backup restoration (corrupción)
  - Backup usado: _______
  - Duración: _______
  - Resultado: PASS / FAIL
  - Notas: _______

- [ ] Test 3: Disaster recovery (nueva DB)
  - Provider: _______
  - Duración: _______
  - Resultado: PASS / FAIL
  - Notas: _______

**Responsable:** _______
**Fecha:** _______
**Sign-off:** _______
```

---

## 🚨 Contact List (Incident Response)

**Escalar en orden:**
1. **DevOps On-Call:** +52-XXX-XXX-XXXX
2. **Database Admin:** admin@bloom.com
3. **Neon Support:** https://neon.tech/support (Pro plan)
4. **AWS Support:** (si S3 backups fallan)

**Canales de comunicación:**
- Slack: #incidents
- Status page: https://status.bloom.com
- Email: incidents@bloom.com

---

## 📝 Maintenance Tasks

### Diario (Automatizado)
- [x] Backup a S3 via cron
- [x] Verificar tamaño de backups
- [x] Log de backup success/failure

### Semanal (Manual)
- [ ] Revisar logs de backup
- [ ] Validar integridad de últimos 7 backups
- [ ] Verificar espacio en S3

### Mensual (Manual)
- [ ] Test de restauración desde PITR
- [ ] Revisar retention policies
- [ ] Actualizar documentación

### Trimestral (Manual)
- [ ] Recovery drill completo
- [ ] Revisar RTO/RPO objectives
- [ ] Actualizar contact list
- [ ] Audit de seguridad de backups

---

## 🔐 Seguridad de Backups

**Encriptación:**
- [x] En tránsito: TLS 1.3 (Neon ↔ App)
- [x] En reposo: AES-256 (S3, Neon storage)
- [ ] Backup files: GPG encryption (pending)

**Control de Acceso:**
- Backups S3: IAM roles con MFA
- Neon Console: 2FA obligatorio
- Scripts: Permisos 700 (solo owner)

**Secrets Management:**
- DATABASE_URL en AWS Secrets Manager
- Rotación: cada 90 días
- Audit log: CloudTrail

---

## 📊 Monitoring & Alerts

**CloudWatch Alarms:**
```yaml
Alerts:
  - Name: BackupFailed
    Metric: BackupSuccess
    Threshold: 0
    Period: 1 day
    Action: SNS > PagerDuty

  - Name: BackupSizeAnomaly
    Metric: BackupSize
    Threshold: 50% deviation
    Period: 1 day
    Action: Email DevOps

  - Name: S3SyncFailed
    Metric: S3SyncErrors
    Threshold: 1
    Period: 1 hour
    Action: Slack #incidents
```

---

## ✅ Checklist de Implementación

**Fase 1: Setup (Completado)**
- [x] Scripts de backup creados
- [x] Documentación escrita
- [x] Retention policies definidas

**Fase 2: Automation (Pendiente)**
- [ ] Configurar cron jobs
- [ ] Setup S3 bucket con lifecycle
- [ ] Configurar CloudWatch alerts
- [ ] Crear sync-to-s3 script

**Fase 3: Testing (Pendiente)**
- [ ] Primer recovery drill
- [ ] Validar RTO/RPO
- [ ] Documentar lecciones aprendidas

**Fase 4: Monitoring (Pendiente)**
- [ ] Dashboard de backups
- [ ] Integrar con status page
- [ ] Automatizar reporting mensual

---

## 📚 Referencias

- [Neon PITR Documentation](https://neon.tech/docs/manage/backups)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

---

**Última revisión:** 3 de diciembre de 2025  
**Próxima revisión:** 3 de marzo de 2026  
**Versión:** 1.0
