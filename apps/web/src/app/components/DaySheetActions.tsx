"use client";

import { EventoraButton } from "./ui/EventoraButton";

interface DaySheetActionsProps {
  reservationId: string;
  status: string;
  onCheckIn: (id: string) => void;
  onMarkNoShow: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export function DaySheetActions({ reservationId, status, onCheckIn, onMarkNoShow, onComplete, onCancel }: DaySheetActionsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {status === "scheduled" && (
        <>
          <EventoraButton onClick={() => onCheckIn(reservationId)}>
            Check-in
          </EventoraButton>
          <EventoraButton
            variant="ghost"
            onClick={() => onMarkNoShow(reservationId)}
          >
            No show
          </EventoraButton>
          <EventoraButton
            variant="ghost"
            onClick={() => onCancel(reservationId)}
          >
            Cancelar
          </EventoraButton>
        </>
      )}

      {status === "checked_in" && (
        <EventoraButton onClick={() => onComplete(reservationId)}>
          Completar
        </EventoraButton>
      )}

      {(status === "completed" || status === "cancelled" || status === "no_show") && (
        <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
          {status === "completed" && "✓ Completada"}
          {status === "cancelled" && "✗ Cancelada"}
          {status === "no_show" && "⊘ No show"}
        </span>
      )}
    </div>
  );
}
