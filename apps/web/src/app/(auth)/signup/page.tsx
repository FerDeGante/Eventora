"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxServices: number;
  maxUsers: number;
  features: Record<string, boolean>;
  sortOrder: number;
};

type DisplayPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  isEnterprise?: boolean;
};

const formatPlanFeatures = (plan: Plan): string[] => {
  const features: string[] = [];
  features.push(`Hasta ${plan.maxUsers} usuarios`);
  features.push(`${plan.maxBranches} ${plan.maxBranches === 1 ? "sucursal" : "sucursales"}`);
  features.push(`${plan.maxServices} servicios`);
  if (plan.features?.analytics) features.push("Analytics en tiempo real");
  if (plan.features?.customBranding) features.push("Branding personalizado");
  if (plan.features?.whatsappNotifications) features.push("Notificaciones WhatsApp");
  if (plan.features?.apiAccess) features.push("Acceso API");
  if (plan.features?.prioritySupport) features.push("Soporte prioritario");
  if (plan.features?.dedicatedSupport) features.push("Soporte dedicado");
  return features;
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);

  const [form, setForm] = useState({
    workspaceName: "",
    slug: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
  });

  // Load plans from API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await apiFetch<{ plans: Plan[] }>("/api/v1/onboarding/plans");
        const displayPlans: DisplayPlan[] = response.plans.map((p, idx) => ({
          id: p.id,
          name: p.name,
          price: p.priceMonthly / 100, // Convert from cents
          features: formatPlanFeatures(p),
          popular: idx === 1, // Middle plan is popular
          isEnterprise: p.name.toLowerCase() === "enterprise",
        }));
        setPlans(displayPlans);
        
        // Preselect plan if specified in URL
        if (preselectedPlan) {
          const found = displayPlans.find(
            (p) => p.name.toLowerCase() === preselectedPlan.toLowerCase() || p.id === preselectedPlan
          );
          if (found) {
            setSelectedPlan(found);
            setStep(2);
          }
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
        // Fallback plans if API fails
        setPlans([
          {
            id: "starter",
            name: "Starter",
            price: 599,
            features: ["3 usuarios", "1 sucursal", "10 servicios"],
          },
          {
            id: "professional",
            name: "Professional",
            price: 1299,
            popular: true,
            features: ["10 usuarios", "3 sucursales", "50 servicios", "Analytics"],
          },
          {
            id: "enterprise",
            name: "Enterprise",
            price: 2999,
            isEnterprise: true,
            features: ["50 usuarios", "10 sucursales", "200 servicios", "API", "Soporte dedicado"],
          },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, [preselectedPlan]);

  // Auto-generate slug from workspace name
  useEffect(() => {
    if (form.workspaceName) {
      const slug = form.workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.workspaceName]);

  const handlePlanSelect = (plan: DisplayPlan) => {
    if (plan.isEnterprise) {
      window.location.href = "mailto:ventas@eventora.com.mx?subject=Enterprise%20Plan";
      return;
    }
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ checkoutUrl: string | null; message?: string }>("/api/v1/onboarding/signup", {
        method: "POST",
        json: {
          workspaceName: form.workspaceName,
          workspaceSlug: form.slug,
          name: form.ownerName,
          email: form.ownerEmail,
          password: form.password,
          planId: selectedPlan.id,
          interval: "monthly",
        },
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        // Trial sin pago requerido
        router.push("/dashboard?welcome=true");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear tu cuenta");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlans) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: "center", padding: 60 }}>
          <div style={styles.spinner} />
          <p style={{ color: "#6b7280", marginTop: 16 }}>Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <Link href="/" style={styles.logo}>
            Eventora
          </Link>
          <h1 style={styles.title}>
            {step === 1 ? "Elige tu plan" : "Configura tu workspace"}
          </h1>
          <p style={styles.subtitle}>
            {step === 1
              ? "Comienza con 14 días de prueba gratis. Sin tarjeta requerida."
              : "Último paso antes de activar tu cuenta."}
          </p>
        </div>

        {/* Progress */}
        <div style={styles.progress}>
          <div style={{ ...styles.progressStep, ...(step >= 1 ? styles.progressActive : {}) }}>
            <span style={styles.progressDot}>1</span>
            <span>Plan</span>
          </div>
          <div style={styles.progressLine} />
          <div style={{ ...styles.progressStep, ...(step >= 2 ? styles.progressActive : {}) }}>
            <span style={styles.progressDot}>2</span>
            <span>Cuenta</span>
          </div>
          <div style={styles.progressLine} />
          <div style={{ ...styles.progressStep, ...(step >= 3 ? styles.progressActive : {}) }}>
            <span style={styles.progressDot}>3</span>
            <span>Pago</span>
          </div>
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div style={styles.plans}>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                style={{
                  ...styles.planCard,
                  ...(plan.popular ? styles.planPopular : {}),
                  ...(selectedPlan?.id === plan.id ? styles.planSelected : {}),
                }}
              >
                {plan.popular && <span style={styles.badge}>Más popular</span>}
                <h3 style={styles.planName}>{plan.name}</h3>
                <div style={styles.planPrice}>
                  {plan.isEnterprise ? (
                    <span style={styles.customPrice}>Contactar</span>
                  ) : (
                    <>
                      <span style={styles.currency}>$</span>
                      <span style={styles.amount}>{plan.price.toLocaleString()}</span>
                      <span style={styles.period}>/mes</span>
                    </>
                  )}
                </div>
                <ul style={styles.features}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={styles.feature}>
                      <span style={styles.check}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <span style={{ ...styles.selectBtn, ...(plan.popular ? styles.selectBtnPrimary : {}) }}>
                  {plan.isEnterprise ? "Contactar ventas" : "Seleccionar"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Account Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.selectedPlan}>
              <span>Plan seleccionado:</span>
              <strong>{selectedPlan?.name}</strong>
              <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>
                Cambiar
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nombre de tu negocio</label>
                <input
                  type="text"
                  value={form.workspaceName}
                  onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                  placeholder="Ej: Studio Zen"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>URL de tu workspace</label>
                <div style={styles.slugInput}>
                  <span style={styles.slugPrefix}>eventora.com.mx/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    placeholder="studio-zen"
                    style={{ ...styles.input, paddingLeft: 0 }}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Tu nombre</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="María García"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  placeholder="maria@studiozen.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.actions}>
              <button type="button" onClick={() => setStep(1)} style={styles.backBtn}>
                ← Atrás
              </button>
              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Procesando..." : "Continuar al pago →"}
              </button>
            </div>

            <p style={styles.terms}>
              Al continuar, aceptas los{" "}
              <Link href="/terms" style={styles.link}>
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" style={styles.link}>
                Política de Privacidad
              </Link>
              .
            </p>
          </form>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={styles.link}>
            Iniciar sesión
          </Link>
        </div>
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
    padding: "40px 20px",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 900,
    background: "#fff",
    borderRadius: 24,
    padding: "40px 48px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    color: "#6366f1",
    textDecoration: "none",
    letterSpacing: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#111827",
    margin: "16px 0 8px",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    margin: 0,
  },
  progress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  progressStep: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#9ca3af",
    fontSize: 14,
  },
  progressActive: {
    color: "#6366f1",
    fontWeight: 600,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "currentColor",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
  },
  progressLine: {
    width: 48,
    height: 2,
    background: "#e5e7eb",
  },
  plans: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  planCard: {
    padding: 24,
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  },
  planPopular: {
    borderColor: "#6366f1",
    boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.3)",
  },
  planSelected: {
    borderColor: "#6366f1",
    background: "#faf5ff",
  },
  badge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#6366f1",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  planName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 12px",
  },
  planPrice: {
    display: "flex",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 16,
  },
  currency: {
    fontSize: 18,
    color: "#6b7280",
  },
  amount: {
    fontSize: 40,
    fontWeight: 800,
    color: "#111827",
  },
  period: {
    fontSize: 14,
    color: "#6b7280",
  },
  customPrice: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
  },
  features: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 20px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#4b5563",
    padding: "6px 0",
  },
  check: {
    color: "#10b981",
    fontWeight: 700,
  },
  selectBtn: {
    display: "block",
    width: "100%",
    padding: "12px 0",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    fontSize: 14,
    textAlign: "center",
  },
  selectBtnPrimary: {
    background: "#6366f1",
    borderColor: "#6366f1",
    color: "#fff",
  },
  form: {
    maxWidth: 600,
    margin: "0 auto",
  },
  selectedPlan: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    background: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 24,
    fontSize: 14,
  },
  changeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#6366f1",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
  },
  slugInput: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },
  slugPrefix: {
    padding: "12px 0 12px 14px",
    background: "#f9fafb",
    color: "#6b7280",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  error: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    margin: "16px 0",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 32,
  },
  backBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 15,
  },
  submitBtn: {
    padding: "12px 32px",
    borderRadius: 10,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
  },
  terms: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 24,
  },
  link: {
    color: "#6366f1",
    textDecoration: "none",
  },
  footer: {
    textAlign: "center",
    marginTop: 32,
    paddingTop: 24,
    borderTop: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#6b7280",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e5e7eb",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};
