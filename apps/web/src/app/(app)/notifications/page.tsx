"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { GlowCard } from "../../components/ui/GlowCard";
import { EventoraButton } from "../../components/ui/EventoraButton";
import {
  getNotificationTemplates,
  updateNotificationTemplate,
  type NotificationTemplate,
} from "../../lib/admin-api";
import { useUxMetrics } from "../../hooks/useUxMetrics";

const fallbackTemplates: NotificationTemplate[] = [
  {
    id: "template_reserva",
    name: "Reserva exitosa",
    description: "Confirmación con CTA para agregar a Calendar y Wallet.",
    channels: ["email", "whatsapp"],
    status: "active",
    schedule: "Inmediato",
    triggers: ["reservation.created"],
    subject: "Tu reserva en Eventora está confirmada",
    html: "<p>Confirmamos tu reserva Eventora. Agrega a tu calendario.</p>",
    text: "Confirmamos tu reserva Eventora.",
  },
  {
    id: "template_reminder_24",
    name: "Recordatorio 24h",
    description: "Correo + WhatsApp con detalles y botón de reagendar.",
    channels: ["email", "whatsapp"],
    status: "active",
    schedule: "24h antes",
    triggers: ["reservation.reminder_24h"],
    subject: "Nos vemos mañana en Eventora",
    html: "<p>Recordatorio 24h · puedes reagendar desde tu panel Eventora.</p>",
    text: "Recordatorio 24h · responde para reagendar.",
  },
  {
    id: "template_reminder_1",
    name: "Recordatorio 1h",
    description: "SMS + Push para asegurar asistencia.",
    channels: ["sms", "push"],
    status: "active",
    schedule: "1h antes",
    triggers: ["reservation.reminder_1h"],
    subject: "Tu sesión comienza en 1h",
    html: "<p>En 1 hora te esperamos para tu sesión en Eventora.</p>",
    text: "Tu sesión comienza en 1h · avísanos si necesitas apoyo.",
  },
  {
    id: "template_followup",
    name: "Seguimiento Eventora+",
    description: "Correo de seguimiento \"Vuelve a Eventora\" con incentivo.",
    channels: ["email"],
    status: "paused",
    schedule: "12h después",
    triggers: ["reservation.follow_up"],
    subject: "¿Cómo te sentiste en tu última sesión?",
    html: "<p>Cuéntanos tu experiencia y agenda la siguiente sesión.</p>",
    text: "¿Cómo te sentiste? Reserva tu siguiente sesión aquí.",
  },
  {
    id: "template_discount",
    name: "Código de descuento",
    description: "Campañas de retención o membresías.",
    channels: ["email"],
    status: "draft",
    schedule: "Manual",
    triggers: ["campaign.manual"],
    subject: "Tu código Eventora+ está listo",
    html: "<p>Activa tu beneficio y agenda tu sesión.</p>",
    text: "Activa tu código Eventora+ y agenda.",
  },
  {
    id: "template_admin_alert",
    name: "Notificación staff/admin",
    description: "Aviso de nueva reserva para admins y terapeutas.",
    channels: ["email", "whatsapp"],
    status: "active",
    schedule: "Inmediato",
    triggers: ["reservation.created"],
    subject: "Nueva reservación en Eventora",
    html: "<p>Se creó una nueva reservación en Eventora.</p>",
    text: "Nueva reservación en Eventora.",
  },
  {
    id: "template_password_reset",
    name: "Password reset",
    description: "Resend password reset con link seguro.",
    channels: ["email"],
    status: "active",
    schedule: "Inmediato",
    triggers: ["auth.password_reset"],
    subject: "Restablece tu contraseña Eventora",
    html: "<p>Usa el código adjunto para restablecer tu contraseña.</p>",
    text: "Código Eventora para resetear contraseña.",
  },
  {
    id: "template_2fa",
    name: "Autenticación 2FA",
    description: "Código de verificación multi-factor.",
    channels: ["email", "sms"],
    status: "active",
    schedule: "Inmediato",
    triggers: ["auth.2fa_challenge"],
    subject: "Tu código de verificación",
    html: "<p>Este es tu código de autenticación de dos factores.</p>",
    text: "Código de verificación Eventora.",
  },
];

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const track = useUxMetrics("notifications");
  const { data = fallbackTemplates, isLoading, isError } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: getNotificationTemplates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    onError: (err) => track("error", { message: err.message }),
    onSuccess: (payload) => track("load", { templates: payload.length }),
  });

  const templates = data.length ? data : fallbackTemplates;
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? fallbackTemplates[0]?.id ?? "");
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [templates, selectedId],
  );
  const [formState, setFormState] = useState({
    status: selectedTemplate?.status ?? "draft",
    schedule: selectedTemplate?.schedule ?? "",
    description: selectedTemplate?.description ?? "",
    subject: selectedTemplate?.subject ?? "",
    html: selectedTemplate?.html ?? "",
    text: selectedTemplate?.text ?? "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTemplate) {
      setFormState({
        status: selectedTemplate.status,
        schedule: selectedTemplate.schedule ?? "",
        description: selectedTemplate.description ?? "",
        subject: selectedTemplate.subject ?? "",
        html: selectedTemplate.html ?? "",
        text: selectedTemplate.text ?? "",
      });
      setFeedback(null);
    }
  }, [selectedTemplate]);

  const mutation = useMutation({
    mutationFn: (input: { id: string; payload: Partial<NotificationTemplate> }) =>
      updateNotificationTemplate(input.id, input.payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationTemplate[]>(["notification-templates"], (old) => {
        if (!old) return [updated];
        return old.map((template) => (template.id === updated.id ? { ...template, ...updated } : template));
      });
      setFeedback("Cambios guardados · Resend actualizado");
      track("action", { template: updated.id, status: updated.status });
    },
    onError: () => {
      setFeedback("Error al guardar. Intenta de nuevo.");
      track("error", { message: "save_failed" });
    },
  });

  const handleSave = () => {
    if (!selectedTemplate) return;
    mutation.mutate({
      id: selectedTemplate.id,
      payload: {
        status: formState.status as NotificationTemplate["status"],
        schedule: formState.schedule,
        description: formState.description,
        subject: formState.subject,
        html: formState.html,
        text: formState.text,
      },
    });
  };

  return (
    <div className="notifications-shell glass-panel">
      <SectionHeading eyebrow="Resend + Eventora" title="Controla tus plantillas y recordatorios.">
        Automatiza confirmaciones, recordatorios, seguimiento y seguridad desde Eventora admin.
      </SectionHeading>
      <div className="notifications-status">
        {isLoading && <span>Sincronizando plantillas...</span>}
        {isError && <span>Mostrando configuración en local hasta nuevo aviso.</span>}
        {!isLoading && !isError && <span>Datos en vivo desde API v1 · Resend</span>}
      </div>
      <div className="notifications-grid">
        <div className="notifications-list glass-panel">
          <ul>
            {templates.map((template) => (
              <li
                key={template.id}
                className={selectedTemplate?.id === template.id ? "is-active" : ""}
                onClick={() => setSelectedId(template.id)}
              >
                <div>
                  <p>{template.name}</p>
                  <span>{template.schedule ?? "Manual"}</span>
                </div>
                <span className={`notification-badge status-${template.status ?? "draft"}`}>{template.status ?? "draft"}</span>
              </li>
            ))}
          </ul>
        </div>
        {selectedTemplate && (
          <GlowCard className="notifications-detail">
            <p className="notifications-detail__eyebrow">Plantilla seleccionada</p>
            <h3>{selectedTemplate.name}</h3>
            <p className="notifications-detail__copy">{selectedTemplate.description}</p>
            <div className="notifications-form">
              <label>
                <span>Estado</span>
                <select value={formState.status} onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value }))}>
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="draft">Borrador</option>
                </select>
              </label>
              <label>
                <span>Programación</span>
                <input
                  value={formState.schedule}
                  onChange={(e) => setFormState((s) => ({ ...s, schedule: e.target.value }))}
                  placeholder="Inmediato / 24h antes / Manual"
                />
              </label>
              <label>
                <span>Descripción</span>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                />
              </label>
              <label>
                <span>Asunto</span>
                <input value={formState.subject} onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))} />
              </label>
              <label>
                <span>HTML (correo)</span>
                <textarea
                  value={formState.html}
                  onChange={(e) => setFormState((s) => ({ ...s, html: e.target.value }))}
                  rows={4}
                />
              </label>
              <label>
                <span>Texto WhatsApp / SMS</span>
                <textarea
                  value={formState.text}
                  onChange={(e) => setFormState((s) => ({ ...s, text: e.target.value }))}
                  rows={3}
                />
              </label>
            </div>
            <div className="notifications-meta">
              <div>
                <p>Canales</p>
                <div className="notifications-chips">
                  {(selectedTemplate.channels ?? ["email"]).map((channel) => (
                    <span key={channel}>{channel}</span>
                  ))}
                </div>
              </div>
              <div>
                <p>Disparadores</p>
                <div className="notifications-chips">
                  {(selectedTemplate.triggers ?? ["N/A"]).map((trigger) => (
                    <span key={trigger}>{trigger}</span>
                  ))}
                </div>
              </div>
              {selectedTemplate.schedule && (
                <div>
                  <p>Programación</p>
                  <span className="notifications-schedule">{selectedTemplate.schedule}</span>
                </div>
              )}
            </div>
            <div className="notifications-preview glass-panel">
              <p className="notifications-detail__eyebrow">Preview correo</p>
              <div className="notifications-preview__html" dangerouslySetInnerHTML={{ __html: formState.html || "<p>Agrega contenido HTML</p>" }} />
              <p className="notifications-detail__eyebrow">Preview WhatsApp/SMS</p>
              <pre className="notifications-preview__text">{formState.text || "Agrega copy para WhatsApp/SMS"}</pre>
            </div>
            <div className="notifications-actions">
              <EventoraButton onClick={handleSave} disabled={mutation.isLoading}>
                {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
              </EventoraButton>
              <EventoraButton variant="ghost">Abrir en Resend</EventoraButton>
            </div>
            {feedback && <p className="notifications-feedback">{feedback}</p>}
          </GlowCard>
        )}
      </div>
    </div>
  );
}
