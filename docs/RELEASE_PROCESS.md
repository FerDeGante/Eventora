# Release Process — Eventora

> Proceso de despliegue a producción  
> Última actualización: 2026-01-19

---

## Entornos

| Entorno | URL | Branch | Auto-deploy |
|---------|-----|--------|-------------|
| Development | localhost:3000 / :4000 | `*` | No |
| Staging | staging.eventora.com | `develop` | Sí |
| Production | eventora.com / api.eventora.com | `main` | No* |

*Production requiere aprobación manual.

---

## Pre-requisitos

1. ✅ Todos los tests pasan
2. ✅ Linting sin errores
3. ✅ Build exitoso
4. ✅ PR aprobado por al menos 1 reviewer
5. ✅ QA checklist completado

---

## Proceso de Release

### 1. Preparar Release

```bash
# Desde develop, crear release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Actualizar versión
npm version 1.0.0 --workspaces --no-git-tag-version
```

### 2. Actualizar CHANGELOG

```markdown
## [1.0.0] - 2026-01-24

### Added
- Feature X
- Feature Y

### Fixed
- Bug Z

### Changed
- Mejora W
```

### 3. Tests Finales

```bash
# Backend tests
cd apps/api
pnpm test

# Frontend tests
cd ../web
pnpm test

# E2E tests
pnpm test:e2e
```

### 4. Build de Producción

```bash
# Backend
cd apps/api
pnpm build

# Frontend
cd ../web
pnpm build
```

### 5. Merge a Main

```bash
# Merge release → main
git checkout main
git merge release/v1.0.0 --no-ff

# Tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

---

## Deployment Steps

### Backend (Fly.io / Railway / Render)

```bash
# Opción 1: Fly.io
fly deploy --app eventora-api

# Opción 2: Railway
railway up

# Opción 3: Docker manual
docker build -t eventora-api:1.0.0 apps/api
docker push registry.example.com/eventora-api:1.0.0
```

### Frontend (Vercel / Netlify)

```bash
# Vercel (auto-deploy desde main)
# Solo verificar que el deploy se completó

# O manual
cd apps/web
vercel --prod
```

### Database Migrations

```bash
# Conectar a production DB
DATABASE_URL="production_url" pnpm prisma migrate deploy
```

---

## Post-Deploy Checklist

- [ ] Verificar health endpoint: `GET /health`
- [ ] Verificar home page carga
- [ ] Login funcional
- [ ] Crear reservación test
- [ ] Verificar Sentry recibe eventos
- [ ] Verificar logs en producción
- [ ] Webhook de Stripe funcional

---

## Smoke Tests

```bash
# Health check
curl https://api.eventora.com/health

# Version check
curl https://api.eventora.com/version

# Frontend
curl -I https://eventora.com
```

---

## Rollback Procedure

### Si algo falla:

1. **Revertir deploy**
```bash
# Fly.io
fly releases --app eventora-api
fly deploy --app eventora-api --image eventora-api:v0.9.0

# Vercel
vercel rollback
```

2. **Revertir migrations (si necesario)**
```bash
# CUIDADO: Puede causar pérdida de datos
DATABASE_URL="production_url" pnpm prisma migrate resolve --rolled-back MIGRATION_NAME
```

3. **Comunicar al equipo**
- Notificar en Slack #eventora-ops
- Documentar en post-mortem

---

## Hotfix Process

Para fixes urgentes en producción:

```bash
# Crear hotfix branch desde main
git checkout main
git checkout -b hotfix/critical-fix

# Hacer el fix
# ...

# Merge a main y deploy
git checkout main
git merge hotfix/critical-fix
git tag -a v1.0.1 -m "Hotfix: critical-fix"
git push origin main --tags

# Merge back a develop
git checkout develop
git merge main
```

---

## Monitoreo Post-Release

### Primeras 24 horas

- [ ] Error rate < 1%
- [ ] Response time p95 < 500ms
- [ ] No errores 5xx nuevos en Sentry
- [ ] Usuarios pueden completar flujos core

### Primera semana

- [ ] Feedback de usuarios
- [ ] Performance baseline establecido
- [ ] Métricas de negocio normales

---

## Contactos de Emergencia

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Lead Dev | TBD | email/slack |
| DevOps | TBD | email/slack |
| Product | TBD | email/slack |

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t eventora-api apps/api
      - run: docker build -t eventora-web apps/web

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: fly deploy --app eventora-api
```

---

*Documentar cualquier cambio al proceso en este archivo.*
