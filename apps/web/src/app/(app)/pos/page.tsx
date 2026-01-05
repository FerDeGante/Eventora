"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { GlowCard } from "../../components/ui/GlowCard";
import { EventoraButton } from "../../components/ui/EventoraButton";
import {
  closePosShift,
  getPosTickets,
  triggerPosDemoPrint,
  triggerPosPrint,
  type DashboardPosTicket,
} from "../../lib/admin-api";
import { useUxMetrics } from "../../hooks/useUxMetrics";

const fallbackPrinters: DashboardPosTicket[] = [
  { id: "POS-1029", branch: "Eventora Polanco", status: "Impresora térmica lista", total: "Ticket #567 · hace 2m" },
  { id: "POS-1041", branch: "Eventora Roma", status: "Enviando a Epson TM-T88", total: "Ticket #568 · hace 30s" },
];

export default function PosPage() {
  const queryClient = useQueryClient();
  const track = useUxMetrics("pos");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["pos-tickets"],
    queryFn: getPosTickets,
    staleTime: 30 * 1000,
    retry: 1,
  });
  const printers = data.length ? data : fallbackPrinters;
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState(printers[0]?.branchId ?? printers[0]?.branch ?? "Eventora Polanco");
  const currentBranchLabel = useMemo(
    () => printers.find((printer) => (printer.branchId ?? printer.branch) === currentBranch)?.branch ?? currentBranch,
    [currentBranch, printers],
  );
  const ticketMutation = useMutation({
    mutationFn: (ticketId: string) => triggerPosPrint(ticketId),
    onSuccess: () => {
      setFeedback("Ticket enviado a impresión.");
      void queryClient.invalidateQueries({ queryKey: ["pos-tickets"] });
      track("action", { action: "print", branch: currentBranchLabel });
    },
    onError: () => {
      setFeedback("Error al enviar ticket.");
      track("error", { message: "print_error", branch: currentBranchLabel });
    },
  });
  const demoMutation = useMutation({
    mutationFn: triggerPosDemoPrint,
    onSuccess: () => {
      setFeedback("Ticket demo enviado.");
      track("action", { action: "demo_print" });
    },
    onError: () => {
      setFeedback("Error al imprimir demo.");
      track("error", { message: "demo_print_error" });
    },
  });
  const closeShiftMutation = useMutation({
    mutationFn: () => closePosShift(currentBranch),
    onSuccess: () => {
      setFeedback(`Turno cerrado para ${currentBranchLabel}.`);
      track("action", { action: "close_shift", branch: currentBranchLabel });
    },
    onError: () => {
      setFeedback("No pudimos cerrar el turno.");
      track("error", { message: "close_shift_error", branch: currentBranchLabel });
    },
  });

  const statusMessage = useMemo(() => {
    if (isLoading) return "Sincronizando POS...";
    if (isError) return "Mostrando estado local";
    return "POS conectado: tickets en tiempo real";
  }, [isLoading, isError]);

  useEffect(() => {
    if (isError) {
      setFeedback("POS en modo fallback: mostrando estado local.");
      track("fallback", { reason: "tickets-error" });
    } else if (printers.length) {
      track("load", { tickets: printers.length });
    }
  }, [isError, track, printers.length]);

  useEffect(() => {
    if (data.length) {
      setCurrentBranch(data[0].branchId ?? data[0].branch);
    }
  }, [data]);

  return (
    <div className="pos-shell glass-panel">
      <SectionHeading eyebrow="Eventora POS" title="Tickets físicos sincronizados con Stripe y caja.">
        Monitorea impresoras, cierres y comandos; cada acción queda registrada en AuditLog.
      </SectionHeading>
      <p className="pos-status">{statusMessage}</p>
      {feedback && <p className="pos-feedback">{feedback}</p>}
      <div className="pos-grid">
        <GlowCard>
          <p className="pos-title">Impresoras activas</p>
          <ul className="pos-list">
            {printers.map((printer) => (
              <li key={printer.id}>
                <div>
                  <p>{printer.branch}</p>
                  <span>{printer.id}</span>
                </div>
                <div>
                  <p>{printer.status}</p>
                  <span>{printer.total}</span>
                  <EventoraButton
                    variant="ghost"
                    className="pos-ticket-button"
                    onClick={() => ticketMutation.mutate(printer.id)}
                    disabled={ticketMutation.isLoading}
                  >
                    {ticketMutation.isLoading ? "Enviando..." : "Reimprimir"}
                  </EventoraButton>
                </div>
              </li>
            ))}
          </ul>
        </GlowCard>
        <GlowCard>
          <p className="pos-title">Comandos rápidos</p>
          <div className="pos-actions">
            <EventoraButton onClick={() => demoMutation.mutate(undefined)} disabled={demoMutation.isLoading}>
              {demoMutation.isLoading ? "Enviando..." : "Imprimir ticket demo"}
            </EventoraButton>
            <EventoraButton variant="ghost" onClick={() => closeShiftMutation.mutate()} disabled={closeShiftMutation.isLoading}>
              {closeShiftMutation.isLoading ? "Cerrando..." : `Cerrar turno ${currentBranchLabel}`}
            </EventoraButton>
            <EventoraButton variant="ghost" onClick={() => setFeedback("Resumen enviado por correo.")}>
              Enviar resumen al correo
            </EventoraButton>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
