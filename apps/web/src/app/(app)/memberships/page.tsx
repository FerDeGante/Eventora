"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  type Membership,
  type CreateMembershipPayload,
  type MembershipType,
  type BillingCycle,
} from "@/lib/admin-api";

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
    gap: "1rem",
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
  primaryButton: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
  } as React.CSSProperties,
  secondaryButton: {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  dangerButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
  } as React.CSSProperties,
  card: {
    background: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    transition: "box-shadow 0.2s ease",
  } as React.CSSProperties,
  cardHeader: {
    padding: "1.25rem",
    borderBottom: "1px solid #f3f4f6",
  } as React.CSSProperties,
  cardName: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  cardDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
  cardBody: {
    padding: "1.25rem",
    flex: 1,
  } as React.CSSProperties,
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: "1rem",
  } as React.CSSProperties,
  priceAmount: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1f2937",
  } as React.CSSProperties,
  priceCycle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginLeft: "0.25rem",
  } as React.CSSProperties,
  featureList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.375rem 0",
    fontSize: "0.875rem",
    color: "#374151",
  } as React.CSSProperties,
  featureIcon: {
    color: "#059669",
    flexShrink: 0,
  } as React.CSSProperties,
  cardFooter: {
    padding: "1rem 1.25rem",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fafafa",
  } as React.CSSProperties,
  typeBadge: (type: MembershipType) => {
    const colors: Record<MembershipType, { bg: string; text: string }> = {
      UNLIMITED: { bg: "#dbeafe", text: "#1d4ed8" },
      SESSIONS_TOTAL: { bg: "#dcfce7", text: "#15803d" },
      SESSIONS_PERIOD: { bg: "#fef3c7", text: "#b45309" },
      TIME_BASED: { bg: "#f3e8ff", text: "#7c3aed" },
    };
    const c = colors[type] || colors.UNLIMITED;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.625rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 500,
      background: c.bg,
      color: c.text,
    } as React.CSSProperties;
  },
  subscriberCount: {
    fontSize: "0.75rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "0.5rem",
  } as React.CSSProperties,
  iconButton: {
    background: "transparent",
    border: "none",
    padding: "0.375rem",
    cursor: "pointer",
    borderRadius: "0.375rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  modal: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "1rem",
  } as React.CSSProperties,
  modalContent: {
    background: "white",
    borderRadius: "0.75rem",
    maxWidth: "36rem",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  } as React.CSSProperties,
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  } as React.CSSProperties,
  modalBody: {
    padding: "1.5rem",
  } as React.CSSProperties,
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  } as React.CSSProperties,
  formGroup: {
    marginBottom: "1.25rem",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    minHeight: "80px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    background: "white",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  } as React.CSSProperties,
  helpText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    color: "#6b7280",
    background: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  tabs: {
    display: "flex",
    gap: "0.25rem",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: active ? "#6366f1" : "#6b7280",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    cursor: "pointer",
    marginBottom: "-1px",
    transition: "all 0.15s ease",
  }) as React.CSSProperties,
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
  conditionalFields: {
    background: "#f9fafb",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
  } as React.CSSProperties,
};

// ============================================
// ICONS
// ============================================
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CrownIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M2 17l3-12 5 6 2-8 2 8 5-6 3 12H2z" />
  </svg>
);

// ============================================
// CONSTANTS
// ============================================
const MEMBERSHIP_TYPES: { value: MembershipType; label: string; description: string }[] = [
  { value: "UNLIMITED", label: "Ilimitado", description: "Acceso sin límite de sesiones" },
  { value: "SESSIONS_TOTAL", label: "Sesiones Totales", description: "Un número fijo de sesiones" },
  { value: "SESSIONS_PERIOD", label: "Sesiones por Periodo", description: "X sesiones por semana/mes" },
  { value: "TIME_BASED", label: "Por Tiempo", description: "Acceso por un número de días" },
];

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" },
];

const TYPE_LABELS: Record<MembershipType, string> = {
  UNLIMITED: "Ilimitado",
  SESSIONS_TOTAL: "Sesiones",
  SESSIONS_PERIOD: "Por Periodo",
  TIME_BASED: "Por Tiempo",
};

const CYCLE_LABELS: Record<BillingCycle, string> = {
  WEEKLY: "/sem",
  BIWEEKLY: "/quinc",
  MONTHLY: "/mes",
  QUARTERLY: "/trim",
  YEARLY: "/año",
};

// ============================================
// TYPES
// ============================================
type MembershipFormData = {
  name: string;
  description: string;
  type: MembershipType;
  price: number;
  billingCycle: BillingCycle;
  inscriptionFee: number;
  sessionsTotal: number;
  sessionsPerPeriod: number;
  periodType: BillingCycle;
  durationDays: number;
  maxFreezeDays: number;
  gracePeriodDays: number;
  isPublic: boolean;
};

// ============================================
// COMPONENT
// ============================================
export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private">("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [deletingMembership, setDeletingMembership] = useState<Membership | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<MembershipFormData>({
    name: "",
    description: "",
    type: "UNLIMITED",
    price: 0,
    billingCycle: "MONTHLY",
    inscriptionFee: 0,
    sessionsTotal: 10,
    sessionsPerPeriod: 4,
    periodType: "WEEKLY",
    durationDays: 30,
    maxFreezeDays: 0,
    gracePeriodDays: 3,
    isPublic: true,
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab === "public" ? { isPublic: true } : activeTab === "private" ? { isPublic: false } : {};
      const response = await getMemberships(params);
      setMemberships(response.memberships);
    } catch (err) {
      console.error("Failed to load memberships:", err);
      setError("Error loading memberships");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format price
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Get features based on type
  const getFeatures = (m: Membership): string[] => {
    const features: string[] = [];
    
    switch (m.type) {
      case "UNLIMITED":
        features.push("Sesiones ilimitadas");
        break;
      case "SESSIONS_TOTAL":
        features.push(`${m.sessionsTotal} sesiones en total`);
        break;
      case "SESSIONS_PERIOD": {
        const periodLabel = CYCLE_LABELS[m.periodType || "MONTHLY"];
        features.push(`${m.sessionsPerPeriod} sesiones${periodLabel}`);
        break;
      }
      case "TIME_BASED":
        features.push(`Acceso por ${m.durationDays} días`);
        break;
    }

    if (m.inscriptionFee > 0) {
      features.push(`Inscripción: ${formatPrice(m.inscriptionFee)}`);
    }
    if (m.maxFreezeDays > 0) {
      features.push(`${m.maxFreezeDays} días de pausa disponibles`);
    }
    if (m.gracePeriodDays > 0) {
      features.push(`${m.gracePeriodDays} días de gracia`);
    }

    return features;
  };

  // Handle modal
  const handleOpenModal = (membership?: Membership) => {
    if (membership) {
      setEditingMembership(membership);
      setFormData({
        name: membership.name,
        description: membership.description || "",
        type: membership.type,
        price: membership.price / 100,
        billingCycle: membership.billingCycle,
        inscriptionFee: membership.inscriptionFee / 100,
        sessionsTotal: membership.sessionsTotal || 10,
        sessionsPerPeriod: membership.sessionsPerPeriod || 4,
        periodType: membership.periodType || "WEEKLY",
        durationDays: membership.durationDays || 30,
        maxFreezeDays: membership.maxFreezeDays,
        gracePeriodDays: membership.gracePeriodDays,
        isPublic: membership.isPublic,
      });
    } else {
      setEditingMembership(null);
      setFormData({
        name: "",
        description: "",
        type: "UNLIMITED",
        price: 0,
        billingCycle: "MONTHLY",
        inscriptionFee: 0,
        sessionsTotal: 10,
        sessionsPerPeriod: 4,
        periodType: "WEEKLY",
        durationDays: 30,
        maxFreezeDays: 0,
        gracePeriodDays: 3,
        isPublic: true,
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: CreateMembershipPayload = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        price: Math.round(formData.price * 100),
        billingCycle: formData.billingCycle,
        inscriptionFee: Math.round(formData.inscriptionFee * 100),
        maxFreezeDays: formData.maxFreezeDays,
        gracePeriodDays: formData.gracePeriodDays,
        isPublic: formData.isPublic,
      };

      // Add type-specific fields
      if (formData.type === "SESSIONS_TOTAL") {
        payload.sessionsTotal = formData.sessionsTotal;
      } else if (formData.type === "SESSIONS_PERIOD") {
        payload.sessionsPerPeriod = formData.sessionsPerPeriod;
        payload.periodType = formData.periodType;
      } else if (formData.type === "TIME_BASED") {
        payload.durationDays = formData.durationDays;
      }

      if (editingMembership) {
        await updateMembership(editingMembership.id, payload);
      } else {
        await createMembership(payload);
      }

      await loadData();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Error saving membership");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMembership) return;

    setSaving(true);
    try {
      await deleteMembership(deletingMembership.id);
      await loadData();
      setShowDeleteModal(false);
      setDeletingMembership(null);
    } catch (err: any) {
      setError(err.message || "Error deleting membership");
    } finally {
      setSaving(false);
    }
  };

  // Render loading
  if (loading && memberships.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Cargando membresías...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Membresías</h1>
          <p style={styles.subtitle}>
            Crea planes de membresía para tus clientes recurrentes
          </p>
        </div>
        <button style={styles.primaryButton} onClick={() => handleOpenModal()}>
          <PlusIcon /> Nueva Membresía
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(activeTab === "all")}
          onClick={() => setActiveTab("all")}
        >
          Todas
        </button>
        <button
          style={styles.tab(activeTab === "public")}
          onClick={() => setActiveTab("public")}
        >
          Públicas
        </button>
        <button
          style={styles.tab(activeTab === "private")}
          onClick={() => setActiveTab("private")}
        >
          Privadas
        </button>
      </div>

      {/* Grid */}
      {memberships.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ margin: "0 auto 1rem", width: "fit-content", color: "#d1d5db" }}>
            <CrownIcon />
          </div>
          <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
            Sin membresías
          </div>
          <p>Crea tu primera membresía para comenzar a ofrecer planes recurrentes</p>
          <button
            style={{ ...styles.primaryButton, marginTop: "1rem", display: "inline-flex" }}
            onClick={() => handleOpenModal()}
          >
            <PlusIcon /> Crear Membresía
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {memberships.map((m) => (
            <div key={m.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardName}>{m.name}</h3>
                {m.description && (
                  <p style={styles.cardDescription}>{m.description}</p>
                )}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.priceRow}>
                  <span style={styles.priceAmount}>{formatPrice(m.price)}</span>
                  <span style={styles.priceCycle}>{CYCLE_LABELS[m.billingCycle]}</span>
                </div>
                <ul style={styles.featureList}>
                  {getFeatures(m).map((feature, i) => (
                    <li key={i} style={styles.featureItem}>
                      <span style={styles.featureIcon}><CheckIcon /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={styles.cardFooter}>
                <div>
                  <span style={styles.typeBadge(m.type)}>
                    {TYPE_LABELS[m.type]}
                  </span>
                  {m._count && m._count.userMemberships > 0 && (
                    <span style={{ ...styles.subscriberCount, marginLeft: "0.75rem" }}>
                      <UsersIcon /> {m._count.userMemberships} suscriptores
                    </span>
                  )}
                </div>
                <div style={styles.actions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => handleOpenModal(m)}
                    title="Editar"
                  >
                    <EditIcon />
                  </button>
                  <button
                    style={{ ...styles.iconButton, color: "#ef4444" }}
                    onClick={() => {
                      setDeletingMembership(m);
                      setShowDeleteModal(true);
                    }}
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingMembership ? "Editar Membresía" : "Nueva Membresía"}
              </h2>
              <button style={styles.iconButton} onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div style={styles.modalBody}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Plan Premium Mensual"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  style={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los beneficios de esta membresía..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Membresía</label>
                <select
                  style={styles.select}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MembershipType })}
                >
                  {MEMBERSHIP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} - {t.description}
                    </option>
                  ))}
                </select>

                {/* Conditional fields based on type */}
                {formData.type === "SESSIONS_TOTAL" && (
                  <div style={styles.conditionalFields}>
                    <label style={styles.label}>Total de Sesiones</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={formData.sessionsTotal}
                      onChange={(e) => setFormData({ ...formData, sessionsTotal: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                )}

                {formData.type === "SESSIONS_PERIOD" && (
                  <div style={styles.conditionalFields}>
                    <div style={styles.formRow}>
                      <div>
                        <label style={styles.label}>Sesiones por Periodo</label>
                        <input
                          type="number"
                          style={styles.input}
                          value={formData.sessionsPerPeriod}
                          onChange={(e) => setFormData({ ...formData, sessionsPerPeriod: parseInt(e.target.value) || 0 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Periodo</label>
                        <select
                          style={styles.select}
                          value={formData.periodType}
                          onChange={(e) => setFormData({ ...formData, periodType: e.target.value as BillingCycle })}
                        >
                          {BILLING_CYCLES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === "TIME_BASED" && (
                  <div style={styles.conditionalFields}>
                    <label style={styles.label}>Días de Acceso</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio (MXN)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ciclo de Cobro</label>
                  <select
                    style={styles.select}
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })}
                  >
                    {BILLING_CYCLES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cuota de Inscripción (MXN)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.inscriptionFee}
                    onChange={(e) => setFormData({ ...formData, inscriptionFee: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                  <p style={styles.helpText}>Se cobra una sola vez al registrarse</p>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Días de Pausa Máximo</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.maxFreezeDays}
                    onChange={(e) => setFormData({ ...formData, maxFreezeDays: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <p style={styles.helpText}>0 = sin opción de pausar</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  <span>Visible públicamente</span>
                </label>
                <p style={styles.helpText}>
                  Las membresías públicas aparecen en tu página de precios
                </p>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                style={styles.primaryButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : editingMembership ? "Guardar Cambios" : "Crear Membresía"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingMembership && (
        <div style={styles.modal} onClick={() => setShowDeleteModal(false)}>
          <div
            style={{ ...styles.modalContent, maxWidth: "24rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Eliminar Membresía</h2>
              <button style={styles.iconButton} onClick={() => setShowDeleteModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div style={styles.modalBody}>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
              <p style={{ margin: 0, color: "#374151" }}>
                ¿Estás seguro que deseas eliminar la membresía{" "}
                <strong>{deletingMembership.name}</strong>?
              </p>
              {deletingMembership._count && deletingMembership._count.userMemberships > 0 && (
                <p style={{ marginTop: "0.5rem", color: "#dc2626", fontSize: "0.875rem" }}>
                  ⚠️ Esta membresía tiene {deletingMembership._count.userMemberships} suscriptores activos.
                </p>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingMembership(null);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                style={styles.dangerButton}
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
