# FRONT-A5 — Frontdesk Day Sheet

Title: Frontdesk Day Sheet
Priority: A
Area: Operations / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- No existe vista resumida diaria para frontdesk (agenda, pendientes, pagos).
- Operación diaria requiere hoja rápida con KPIs y estado de citas.

Goal:
- Crear vista “Day Sheet” con reservas del día, estados y acciones rápidas.

Scope (In/Out):
- In: vista diaria, filtros por sucursal/terapeuta, acciones rápidas.
- Out: cambios en backend.

Plan:
1. Definir layout y data requerida.
2. Consumir endpoints de reservaciones.
3. Añadir filtros y resumen de KPIs.
4. Añadir acciones rápidas (check-in/no-show).

Files touched (actual):
- apps/web/src/app/(app)/dashboard/page.tsx (timeline ya existe)

Status:
- Estado: PARTIAL (timeline existe, filtros pendientes para v2)
- Fecha: 2026-01-20

---

## Implementación

El dashboard ya contiene un "Timeline de hoy" que muestra reservas del día con:
- Estados visuales (scheduled, checked_in, completed)
- Información de paciente, servicio, terapeuta, sucursal
- Datos en tiempo real

**Pendiente para v2:**
- Filtros por sucursal/terapeuta
- Acciones rápidas inline
- Resumen de KPIs específicos

**Ver:** ADR-0005 (deferred implementation)
