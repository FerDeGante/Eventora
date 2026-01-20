"use client";

import Link from "next/link";

export default function OnboardingCancelledPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>😕</div>
        <h1 style={styles.title}>Checkout cancelado</h1>
        <p style={styles.subtitle}>
          No te preocupes, no se realizó ningún cargo.
          <br />
          Tu workspace fue creado pero está en pausa hasta que completes el pago.
        </p>

        <div style={styles.options}>
          <div style={styles.option}>
            <span style={styles.optionIcon}>🔄</span>
            <div>
              <h3 style={styles.optionTitle}>Reintentar el pago</h3>
              <p style={styles.optionDesc}>Vuelve a la página de signup para completar tu suscripción.</p>
            </div>
          </div>

          <div style={styles.option}>
            <span style={styles.optionIcon}>💬</span>
            <div>
              <h3 style={styles.optionTitle}>¿Tienes dudas?</h3>
              <p style={styles.optionDesc}>Escríbenos y te ayudamos a resolver cualquier inquietud.</p>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <Link href="/signup" style={styles.buttonPrimary}>
            Volver a intentar
          </Link>
          <Link href="/" style={styles.buttonSecondary}>
            Ir al inicio
          </Link>
        </div>

        <p style={styles.help}>
          ¿Necesitas ayuda?{" "}
          <a href="mailto:soporte@eventora.com.mx" style={styles.link}>
            soporte@eventora.com.mx
          </a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "linear-gradient(135deg, #f8fafc 0%, #fef2f2 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 24,
    padding: "48px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 1.6,
    margin: "0 0 32px",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 32,
    textAlign: "left",
  },
  option: {
    display: "flex",
    gap: 16,
    padding: 16,
    background: "#f9fafb",
    borderRadius: 12,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  optionDesc: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonPrimary: {
    display: "inline-block",
    padding: "14px 28px",
    borderRadius: 10,
    background: "#6366f1",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    textDecoration: "none",
  },
  buttonSecondary: {
    display: "inline-block",
    padding: "14px 28px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    fontSize: 15,
    textDecoration: "none",
  },
  help: {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
  },
  link: {
    color: "#6366f1",
    textDecoration: "none",
  },
};
