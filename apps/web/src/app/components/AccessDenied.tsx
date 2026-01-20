"use client";

import { useRouter } from "next/navigation";
import { EventoraButton } from "./ui/EventoraButton";

export function AccessDenied({ title = "Sin acceso", message }: { title?: string; message?: string }) {
  const router = useRouter();

  return (
    <div className="access-denied glass-panel" role="alert" aria-live="polite">
      <p className="access-denied__eyebrow">Eventora Security</p>
      <h2 className="access-denied__title">{title}</h2>
      <p className="access-denied__message">
        {message ?? "No tienes permisos para ver esta sección. Si crees que es un error, contacta a tu administrador."}
      </p>
      <div className="access-denied__actions">
        <EventoraButton onClick={() => router.push("/dashboard")}>
          Volver al panel
        </EventoraButton>
      </div>
    </div>
  );
}
