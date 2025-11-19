# Observability & Auditability Blueprint

## Goals
- Detect tenant data leaks, performance regressions, and billing anomalies in near real-time.
- Provide auditable trails per LFPDPPP/GDPR/HIPAA guidance (who did what, when, from where).

## Logging
- Adopt structured logging (pino or Winston) with JSON output. Fields: `timestamp`, `level`, `tenantId`, `userId`, `action`, `resource`, `status`, `latencyMs`, `ip`, `requestId`.
- Mask PII by default (hash emails/phones) and log event types (CREATE_RESERVATION) rather than raw payloads.
- Centralise logs in DataDog, New Relic, or OpenSearch with index per environment + tenant tags.
- Emit audit logs for:
  - Authentication events (login, logout, password reset).
  - Reservation lifecycle (create/update/cancel).
  - Billing actions (Stripe webhook processed, invoice failed).
- Implement 1-year retention (HIPAA-friendly) with monthly export to cold storage (S3 Glacier with SSE-KMS).

## Metrics & SLOs
- Core RED metrics per tenant: `request_rate`, `error_rate`, `latency_p95`.
- Business metrics per tenant: `active_clients`, `reservations_per_day`, `stripe_mrr`.
- Define SLOs:
  - API availability ≥ 99.5% monthly per tenant.
  - Reservation booking latency p95 < 400ms per tenant.
  - Webhook success ratio ≥ 99% per 7-day window.
- Export metrics via OpenTelemetry SDK → Prometheus/Grafana or Datadog dashboards.

## Tracing
- Instrument Next.js API routes with OpenTelemetry auto-instrumentation (HTTP + Prisma).
- Inject `tenantId`, `userId`, and `requestId` attributes on spans to trace cross-service flows.
- Sample at ≥ 10% by default; increase sampling for enterprise tenants.

## Alerting
- Configure alerts for:
  - `error_rate > 2%` for 5 minutes per tenant.
  - Stripe webhook retries > 3 per hour.
  - Rate limiter saturation > 80% for 10 minutes.
  - Suspicious login spikes (failed logins > threshold) to support SOC monitoring.
- Alert channels: PagerDuty (critical), Slack #ops (warning), email (daily digest).

## Dashboards
- **Tenant Overview**: bookings funnel, active packages, revenue trend.
- **Operations**: infrastructure metrics (CPU, memory, DB connections, queue depth) tagged by tenant.
- **Security**: authentication success/failure, privileged actions, audit log anomalies.

## Data Quality & Backups
- Nightly logical backups per tenant (pg_dump with `--where clinic_id='<tenant>'`) stored encrypted.
- Test restore quarterly using anonymised staging environment.
- Implement checksums on export/import jobs.

## Tooling
- Observability stack suggestion:
  - Logging: Pino → OpenSearch.
  - Metrics: OpenTelemetry Collector → Prometheus + Grafana.
  - Tracing: OpenTelemetry Collector → Tempo or Datadog APM.
  - Alerting: PagerDuty integration + Grafana alert rules.
- Automate tenant context propagation through `AsyncLocalStorage` to ensure logs/metrics align.

