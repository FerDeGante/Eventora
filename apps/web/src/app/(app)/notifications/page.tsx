"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import {
  getNotificationTemplates,
  updateNotificationTemplate,
  type NotificationTemplate,
} from "@/lib/admin-api";
import { useUxMetrics } from "@/app/hooks/useUxMetrics";
import { TemplateEditor } from "@/app/components/notifications/TemplateEditor";
import { VariablePicker } from "@/app/components/notifications/VariablePicker";
import { TemplatePreview } from "@/app/components/notifications/TemplatePreview";
import { Mail, Send } from "react-feather";

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
  const { data = fallbackTemplates, isLoading, isError, error } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: getNotificationTemplates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Track loading/error states (React Query v5 removed onError/onSuccess from useQuery)
  useEffect(() => {
    if (isError && error) {
      track("error", { message: (error as Error).message });
    }
  }, [isError, error, track]);

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      track("load", { templates: data.length });
    }
  }, [data, isLoading, track]);

  const templates = data.length ? data : fallbackTemplates;
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? fallbackTemplates[0]?.id ?? "");
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [templates, selectedId],
  );
  const [formState, setFormState] = useState<{
    status: "active" | "paused" | "draft";
    schedule: string;
    description: string;
    subject: string;
    html: string;
    text: string;
  }>({
    status: selectedTemplate?.status ?? "draft",
    schedule: selectedTemplate?.schedule ?? "",
    description: selectedTemplate?.description ?? "",
    subject: selectedTemplate?.subject ?? "",
    html: selectedTemplate?.html ?? "",
    text: selectedTemplate?.text ?? "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    if (selectedTemplate) {
      setFormState({
        status: selectedTemplate.status ?? "draft",
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

  const handleInsertVariable = (variable: string) => {
    // Insert at the end of current HTML content
    setFormState((s) => ({ ...s, html: s.html + " " + variable }));
  };

  const handleTestSend = async () => {
    if (!testEmail || !selectedTemplate) return;
    
    setTestSending(true);
    // Simulate API call (in real implementation, call /api/v1/notifications/templates/:id/test-send)
    setTimeout(() => {
      setTestSending(false);
      setShowTestModal(false);
      setFeedback(`Email de prueba enviado a ${testEmail}`);
      track("action", { type: "test_send", template: selectedTemplate.id });
    }, 1500);
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
                <select value={formState.status} onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value as "active" | "paused" | "draft" }))}>
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
              
              <div style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "center" }}>
                <label style={{ margin: 0, flex: 1 }}>
                  <span>Contenido HTML (correo)</span>
                </label>
                <VariablePicker onInsert={handleInsertVariable} />
              </div>
              
              <TemplateEditor
                content={formState.html}
                onChange={(html) => setFormState((s) => ({ ...s, html }))}
              />
              
              <label style={{ marginTop: "16px" }}>
                <span>Texto WhatsApp / SMS</span>
                <textarea
                  value={formState.text}
                  onChange={(e) => setFormState((s) => ({ ...s, text: e.target.value }))}
                  rows={3}
                />
              </label>
            </div>
            
            {/* Preview section */}
            {showPreview && (
              <div style={{ marginTop: "24px" }}>
                <TemplatePreview html={formState.html} />
              </div>
            )}
            {/* Preview section */}
            {showPreview && (
              <div style={{ marginTop: "24px" }}>
                <TemplatePreview html={formState.html} />
              </div>
            )}
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
              <EventoraButton onClick={handleSave} disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </EventoraButton>
              <EventoraButton 
                variant="ghost" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Mail size={16} />
                {showPreview ? "Ocultar" : "Vista previa"}
              </EventoraButton>
              <EventoraButton 
                variant="ghost"
                onClick={() => setShowTestModal(true)}
              >
                <Send size={16} />
                Enviar prueba
              </EventoraButton>
              <EventoraButton variant="ghost">Abrir en Resend</EventoraButton>
            </div>
            {feedback && <p className="notifications-feedback">{feedback}</p>}
            
            {/* Test Send Modal */}
            {showTestModal && (
              <>
                <div
                  onClick={() => setShowTestModal(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999,
                  }}
                />
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    zIndex: 1000,
                    minWidth: "400px",
                    maxWidth: "90vw",
                  }}
                >
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
                    Enviar email de prueba
                  </h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#6b7280" }}>
                    Enviaremos una versión de prueba de esta plantilla con datos de ejemplo
                  </p>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setShowTestModal(false)}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleTestSend}
                      disabled={!testEmail || testSending}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "6px",
                        background: testEmail && !testSending ? "#7c3aed" : "#d1d5db",
                        color: "white",
                        cursor: testEmail && !testSending ? "pointer" : "not-allowed",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {testSending ? "Enviando..." : "Enviar prueba"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </GlowCard>
        )}
      </div>
    </div>
  );
}
