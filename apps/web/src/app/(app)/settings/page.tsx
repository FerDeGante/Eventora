"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClinicSettings,
  updateClinicSettings,
  type UpdateClinicPayload,
} from "@/lib/admin-api";

const TIMEZONES = [
  "America/Mexico_City",
  "America/Cancun",
  "America/Tijuana",
  "America/Monterrey",
  "America/Los_Angeles",
  "America/New_York",
  "America/Chicago",
  "Europe/Madrid",
  "Europe/London",
];

const CURRENCIES = [
  { code: "MXN", name: "Peso Mexicano", symbol: "$" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
];

const COLOR_PRESETS = [
  { primary: "#6366f1", secondary: "#8b5cf6", name: "Indigo" },
  { primary: "#3b82f6", secondary: "#60a5fa", name: "Azul" },
  { primary: "#10b981", secondary: "#34d399", name: "Esmeralda" },
  { primary: "#f59e0b", secondary: "#fbbf24", name: "Ámbar" },
  { primary: "#ef4444", secondary: "#f87171", name: "Rojo" },
  { primary: "#ec4899", secondary: "#f472b6", name: "Rosa" },
  { primary: "#8b5cf6", secondary: "#a78bfa", name: "Violeta" },
  { primary: "#14b8a6", secondary: "#2dd4bf", name: "Teal" },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "billing" | "integrations">("general");
  const [formData, setFormData] = useState<UpdateClinicPayload>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ["clinic-settings"],
    queryFn: getClinicSettings,
  });

  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name,
        logoUrl: clinic.logoUrl,
        primaryColor: clinic.primaryColor || "#6366f1",
        secondaryColor: clinic.secondaryColor || "#8b5cf6",
        timezone: clinic.timezone || "America/Mexico_City",
        currency: clinic.currency || "MXN",
        phone: clinic.phone || "",
        email: clinic.email || "",
        address: clinic.address || "",
        website: clinic.website,
        description: clinic.description || "",
      });
    }
  }, [clinic]);

  const mutation = useMutation({
    mutationFn: updateClinicSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-settings"] });
      setHasChanges(false);
    },
  });

  const handleChange = (field: keyof UpdateClinicPayload, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const handleColorPreset = (preset: { primary: string; secondary: string }) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
        <div className="loading-spinner" />
        <style jsx>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        Error al cargar configuración: {(error as Error).message}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>
          Configuración
        </h1>
        <p style={{ color: "#6b7280", marginTop: 4 }}>
          Administra tu clínica, marca y preferencias
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
        {[
          { id: "general", label: "General", icon: "⚙️" },
          { id: "branding", label: "Marca", icon: "🎨" },
          { id: "billing", label: "Facturación", icon: "💳" },
          { id: "integrations", label: "Integraciones", icon: "🔗" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: activeTab === tab.id ? "#6366f1" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#6b7280",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24 }}>
        {/* General Tab */}
        {activeTab === "general" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              Información General
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Nombre de la clínica
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Slug (URL)
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  fontSize: 14,
                  color: "#6b7280",
                }}>
                  eventora.com.mx/<strong style={{ color: "#111827" }}>{clinic?.slug}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="hola@tuclínica.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+52 55 1234 5678"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Av. Reforma 123, Col. Centro, CDMX"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Sitio web
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleChange("website", e.target.value || null)}
                  placeholder="https://www.tuclínica.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Zona horaria
                </label>
                <select
                  value={formData.timezone || "America/Mexico_City"}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Moneda
                </label>
                <select
                  value={formData.currency || "MXN"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Descripción
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Una breve descripción de tu clínica..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              Marca y Apariencia
            </h2>

            {/* Logo Upload */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 12 }}>
                Logotipo
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    background: formData.logoUrl ? `url(${formData.logoUrl}) center/cover` : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    color: "#9ca3af",
                    border: "2px dashed #d1d5db",
                  }}
                >
                  {!formData.logoUrl && "📷"}
                </div>
                <div>
                  <input
                    type="url"
                    value={formData.logoUrl || ""}
                    onChange={(e) => handleChange("logoUrl", e.target.value || null)}
                    placeholder="https://ejemplo.com/logo.png"
                    style={{
                      width: 300,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      outline: "none",
                      marginBottom: 8,
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                    PNG, JPG o SVG. Recomendado: 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 12 }}>
                Tema de colores
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorPreset(preset)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: formData.primaryColor === preset.primary
                        ? `2px solid ${preset.primary}`
                        : "2px solid #e5e7eb",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: preset.primary }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: preset.secondary }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Color primario
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="color"
                    value={formData.primaryColor || "#6366f1"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    style={{
                      width: 48,
                      height: 42,
                      padding: 0,
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor || "#6366f1"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Color secundario
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="color"
                    value={formData.secondaryColor || "#8b5cf6"}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    style={{
                      width: 48,
                      height: 42,
                      padding: 0,
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor || "#8b5cf6"}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginTop: 32 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 12 }}>
                Vista previa
              </label>
              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${formData.primaryColor || "#6366f1"} 0%, ${formData.secondaryColor || "#8b5cf6"} 100%)`,
                  color: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  {formData.logoUrl ? (
                    <Image src={formData.logoUrl} alt="Logo" width={40} height={40} style={{ borderRadius: 8 }} unoptimized />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.2)" }} />
                  )}
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{formData.name || "Tu Clínica"}</span>
                </div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
                  Así se verá tu marca en la plataforma
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              Facturación y Pagos
            </h2>

            {/* Stripe Status */}
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: clinic?.stripeOnboardingComplete ? "#ecfdf5" : "#fef3c7",
                border: `1px solid ${clinic?.stripeOnboardingComplete ? "#a7f3d0" : "#fcd34d"}`,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{clinic?.stripeOnboardingComplete ? "✅" : "⚠️"}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                    {clinic?.stripeOnboardingComplete ? "Stripe conectado" : "Stripe pendiente"}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
                    {clinic?.stripeOnboardingComplete
                      ? "Tu cuenta está lista para recibir pagos"
                      : "Completa la configuración para recibir pagos"}
                  </p>
                </div>
              </div>
              {!clinic?.stripeOnboardingComplete && (
                <button
                  style={{
                    marginTop: 16,
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#6366f1",
                    color: "#fff",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Configurar Stripe →
                </button>
              )}
            </div>

            {/* Account Info */}
            {clinic?.stripeAccountId && (
              <div style={{ padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Detalles de cuenta
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase" }}>Account ID</span>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontFamily: "monospace" }}>{clinic.stripeAccountId}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase" }}>Estado</span>
                    <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "#ecfdf5",
                        color: "#059669",
                        fontSize: 12,
                        fontWeight: 500,
                      }}>
                        Activo
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
              Integraciones
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              {[
                { name: "Google Calendar", icon: "📅", status: "connected", desc: "Sincroniza citas automáticamente" },
                { name: "WhatsApp Business", icon: "💬", status: "pending", desc: "Envía recordatorios por WhatsApp" },
                { name: "Zapier", icon: "⚡", status: "available", desc: "Conecta con +5000 apps" },
                { name: "Resend", icon: "📧", status: "connected", desc: "Emails transaccionales" },
              ].map((integration) => (
                <div
                  key={integration.name}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 28 }}>{integration.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111827" }}>{integration.name}</h3>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{integration.desc}</p>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: integration.status === "connected" ? "none" : "1px solid #d1d5db",
                      background: integration.status === "connected" ? "#ecfdf5" : "#fff",
                      color: integration.status === "connected" ? "#059669" : "#374151",
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {integration.status === "connected" ? "✓ Conectado" : integration.status === "pending" ? "Pendiente" : "Conectar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: 280,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            padding: 16,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={() => {
              if (clinic) {
                setFormData({
                  name: clinic.name,
                  logoUrl: clinic.logoUrl,
                  primaryColor: clinic.primaryColor || "#6366f1",
                  secondaryColor: clinic.secondaryColor || "#8b5cf6",
                  timezone: clinic.timezone || "America/Mexico_City",
                  currency: clinic.currency || "MXN",
                  phone: clinic.phone || "",
                  email: clinic.email || "",
                  address: clinic.address || "",
                  website: clinic.website,
                  description: clinic.description || "",
                });
                setHasChanges(false);
              }
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontWeight: 500,
              cursor: mutation.isPending ? "wait" : "pointer",
              opacity: mutation.isPending ? 0.7 : 1,
            }}
          >
            {mutation.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}

      {/* Success Toast */}
      {mutation.isSuccess && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            padding: "12px 20px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            color: "#059669",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ✓ Configuración guardada
        </div>
      )}
    </div>
  );
}
