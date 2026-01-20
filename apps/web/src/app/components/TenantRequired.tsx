"use client";

import { useRouter } from "next/navigation";
import { EventoraButton } from "./ui/EventoraButton";

export function TenantRequired({ message }: { message?: string }) {
  const router = useRouter();

  return (
    <div className="access-denied glass-panel" role="alert" aria-live="polite">
      <p className="access-denied__eyebrow">Configuración Requerida</p>
      <h2 className="access-denied__title">Clínica no configurada</h2>
      <p className="access-denied__message">
        {message ?? "Necesitas seleccionar una clínica antes de acceder a esta sección. Por favor completa tu configuración inicial."}
      </p>
      <div className="access-denied__actions">
        <EventoraButton onClick={() => router.push("/onboarding")}>
          Configurar ahora
        </EventoraButton>
      </div>
    </div>
  );
}
