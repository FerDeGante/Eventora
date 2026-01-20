"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getConnectStatus,
  startConnectOnboarding,
  getStripeDashboardLink,
  type ConnectStatus,
} from "@/lib/admin-api";

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  header: {
    marginBottom: "2rem",
  } as React.CSSProperties,
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#6b7280",
    fontSize: "0.875rem",
    textDecoration: "none",
    marginBottom: "1rem",
  } as React.CSSProperties,
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  card: {
    background: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  cardHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  } as React.CSSProperties,
  stripeLogo: {
    width: "48px",
    height: "48px",
    background: "#635bff",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: "1.25rem",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  cardSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.125rem",
  } as React.CSSProperties,
  cardBody: {
    padding: "1.5rem",
  } as React.CSSProperties,
  cardFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  } as React.CSSProperties,
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 0",
    borderBottom: "1px solid #f3f4f6",
  } as React.CSSProperties,
  statusLabel: {
    fontSize: "0.875rem",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
  statusBadge: (success: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    background: success ? "#dcfce7" : "#fef3c7",
    color: success ? "#15803d" : "#b45309",
  }) as React.CSSProperties,
  primaryButton: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
    textDecoration: "none",
  } as React.CSSProperties,
  stripeButton: {
    background: "#635bff",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    boxShadow: "0 2px 4px rgba(99, 91, 255, 0.3)",
    textDecoration: "none",
  } as React.CSSProperties,
  secondaryButton: {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    textDecoration: "none",
  } as React.CSSProperties,
  alert: (type: "success" | "warning" | "info") => {
    const colors = {
      success: { bg: "#dcfce7", border: "#bbf7d0", text: "#15803d" },
      warning: { bg: "#fef3c7", border: "#fde68a", text: "#b45309" },
      info: { bg: "#dbeafe", border: "#bfdbfe", text: "#1d4ed8" },
    };
    const c = colors[type];
    return {
      padding: "1rem 1.25rem",
      borderRadius: "0.5rem",
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      marginBottom: "1.5rem",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
    } as React.CSSProperties;
  },
  benefitsList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,
  benefitItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "0.5rem 0",
    fontSize: "0.875rem",
    color: "#374151",
  } as React.CSSProperties,
  benefitIcon: {
    color: "#059669",
    flexShrink: 0,
    marginTop: "0.125rem",
  } as React.CSSProperties,
  feeTable: {
    width: "100%",
    marginTop: "1rem",
  } as React.CSSProperties,
  feeRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  feeLabel: {
    color: "#6b7280",
  } as React.CSSProperties,
  feeValue: {
    fontWeight: 600,
    color: "#1f2937",
  } as React.CSSProperties,
  connectedBanner: {
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  connectedIcon: {
    width: "48px",
    height: "48px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  connectedTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    margin: 0,
  } as React.CSSProperties,
  connectedSubtitle: {
    fontSize: "0.875rem",
    opacity: 0.9,
    marginTop: "0.25rem",
  } as React.CSSProperties,
};

// ============================================
// ICONS
// ============================================
const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ============================================
// COMPONENT
// ============================================
function PaymentsSettingsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for success/refresh from Stripe redirect
  const stripeResult = searchParams.get("stripe");

  // Load status
  const loadStatus = useCallback(async () => {
    try {
      const data = await getConnectStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load Connect status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Handle connect
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const result = await startConnectOnboarding(
        `${baseUrl}/settings/payments?stripe=refresh`,
        `${baseUrl}/settings/payments?stripe=success`
      );
      // Redirect to Stripe
      window.location.href = result.onboardingUrl;
    } catch (err: any) {
      setError(err.message || "Error starting onboarding");
      setConnecting(false);
    }
  };

  // Handle dashboard link
  const handleDashboard = async () => {
    try {
      const result = await getStripeDashboardLink();
      window.open(result.url, "_blank");
    } catch (err: any) {
      alert(err.message || "Error opening dashboard");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "1.25rem", color: "#6b7280" }}>Cargando...</div>
        </div>
      </div>
    );
  }

  const isFullyConnected = status?.connected && status?.onboardingComplete && status?.chargesEnabled;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <a href="/settings" style={styles.backLink}>
          <ArrowLeftIcon /> Volver a Configuración
        </a>
        <h1 style={styles.title}>Pagos con Stripe</h1>
        <p style={styles.subtitle}>
          Conecta tu cuenta de Stripe para recibir pagos de tus clientes
        </p>
      </div>

      {/* Alerts based on redirect */}
      {stripeResult === "success" && (
        <div style={styles.alert("success")}>
          <CheckCircleIcon />
          <div>
            <strong>¡Conexión exitosa!</strong>
            <br />
            Tu cuenta de Stripe está conectada. Ya puedes recibir pagos.
          </div>
        </div>
      )}

      {stripeResult === "refresh" && (
        <div style={styles.alert("warning")}>
          <AlertIcon />
          <div>
            <strong>Onboarding incompleto</strong>
            <br />
            El proceso de verificación no se completó. Haz clic en &quot;Continuar Onboarding&quot; para terminar.
          </div>
        </div>
      )}

      {error && (
        <div style={styles.alert("warning")}>
          <AlertIcon />
          <div>{error}</div>
        </div>
      )}

      {/* Connected Banner */}
      {isFullyConnected && (
        <div style={styles.connectedBanner}>
          <div style={styles.connectedIcon}>
            <CheckCircleIcon />
          </div>
          <div>
            <h2 style={styles.connectedTitle}>Pagos Activos</h2>
            <p style={styles.connectedSubtitle}>
              Tu cuenta está completamente verificada y lista para recibir pagos
            </p>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.stripeLogo}>S</div>
          <div>
            <h2 style={styles.cardTitle}>Stripe Connect</h2>
            <p style={styles.cardSubtitle}>
              {status?.connected ? "Cuenta conectada" : "No conectado"}
            </p>
          </div>
        </div>

        <div style={styles.cardBody}>
          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>
              <CreditCardIcon /> Cuenta Conectada
            </span>
            <span style={styles.statusBadge(!!status?.connected)}>
              <CheckIcon />
              {status?.connected ? "Sí" : "No"}
            </span>
          </div>

          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>
              <ShieldIcon /> Verificación Completa
            </span>
            <span style={styles.statusBadge(!!status?.onboardingComplete)}>
              <CheckIcon />
              {status?.onboardingComplete ? "Sí" : "Pendiente"}
            </span>
          </div>

          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>
              <CreditCardIcon /> Cobros Habilitados
            </span>
            <span style={styles.statusBadge(!!status?.chargesEnabled)}>
              <CheckIcon />
              {status?.chargesEnabled ? "Sí" : "No"}
            </span>
          </div>

          <div style={{ ...styles.statusRow, borderBottom: "none" }}>
            <span style={styles.statusLabel}>
              <DollarIcon /> Retiros Habilitados
            </span>
            <span style={styles.statusBadge(!!status?.payoutsEnabled)}>
              <CheckIcon />
              {status?.payoutsEnabled ? "Sí" : "No"}
            </span>
          </div>
        </div>

        <div style={styles.cardFooter}>
          {!status?.connected && (
            <button
              style={styles.stripeButton}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Conectando..." : "Conectar con Stripe"}
              <ExternalLinkIcon />
            </button>
          )}

          {status?.connected && !status?.onboardingComplete && (
            <button
              style={styles.stripeButton}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Conectando..." : "Continuar Onboarding"}
              <ExternalLinkIcon />
            </button>
          )}

          {isFullyConnected && (
            <button style={styles.secondaryButton} onClick={handleDashboard}>
              Abrir Dashboard de Stripe
              <ExternalLinkIcon />
            </button>
          )}
        </div>
      </div>

      {/* Benefits Card */}
      {!status?.connected && (
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#1f2937" }}>
              ¿Por qué conectar Stripe?
            </h3>
            <ul style={styles.benefitsList}>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}><CheckIcon /></span>
                <span>
                  <strong>Recibe pagos directamente</strong> – Los pagos de tus clientes van directo a tu cuenta bancaria
                </span>
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}><CheckIcon /></span>
                <span>
                  <strong>Múltiples métodos de pago</strong> – Acepta tarjetas de crédito, débito y transferencias
                </span>
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}><CheckIcon /></span>
                <span>
                  <strong>Depósitos automáticos</strong> – Recibe tu dinero en 2-3 días hábiles
                </span>
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.benefitIcon}><CheckIcon /></span>
                <span>
                  <strong>Panel de control completo</strong> – Ve todas tus transacciones y métricas en Stripe
                </span>
              </li>
            </ul>

            <div style={styles.feeTable}>
              <h4 style={{ margin: "1rem 0 0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                Comisiones
              </h4>
              <div style={styles.feeRow}>
                <span style={styles.feeLabel}>Comisión por transacción (Stripe)</span>
                <span style={styles.feeValue}>3.6% + $3 MXN</span>
              </div>
              <div style={styles.feeRow}>
                <span style={styles.feeLabel}>Comisión de plataforma (Eventora)</span>
                <span style={styles.feeValue}>Según tu plan</span>
              </div>
              <div style={{ ...styles.feeRow, borderBottom: "none" }}>
                <span style={styles.feeLabel}>Cargos mensuales</span>
                <span style={styles.feeValue}>$0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsSettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>}>
      <PaymentsSettingsContent />
    </Suspense>
  );
}
