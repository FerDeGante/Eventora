"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMemberships,
  getUserMemberships,
  createUserMembership,
  updateUserMembership,
  getClients,
  type Membership,
  type UserMembership,
  type Client,
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
  warningButton: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontWeight: 500,
    cursor: "pointer",
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
  tableContainer: {
    background: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  } as React.CSSProperties,
  th: {
    background: "#f9fafb",
    padding: "0.875rem 1rem",
    textAlign: "left" as const,
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  td: {
    padding: "1rem",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.875rem",
    color: "#374151",
  } as React.CSSProperties,
  userName: {
    fontWeight: 600,
    color: "#1f2937",
  } as React.CSSProperties,
  userEmail: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.125rem",
  } as React.CSSProperties,
  statusBadge: (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: "#dcfce7", text: "#15803d" },
      PAUSED: { bg: "#fef3c7", text: "#b45309" },
      EXPIRED: { bg: "#fee2e2", text: "#dc2626" },
      CANCELLED: { bg: "#f3f4f6", text: "#6b7280" },
      DRAFT: { bg: "#dbeafe", text: "#1d4ed8" },
    };
    const c = colors[status] || colors.DRAFT;
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
    maxWidth: "32rem",
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
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
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
  searchBar: {
    marginBottom: "1.5rem",
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  filterSelect: {
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    background: "white",
    minWidth: "150px",
  } as React.CSSProperties,
  membershipCard: {
    padding: "0.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  } as React.CSSProperties,
  membershipCardSelected: {
    padding: "0.75rem",
    border: "2px solid #6366f1",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
    background: "#eef2ff",
  } as React.CSSProperties,
  membershipName: {
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  membershipDetails: {
    fontSize: "0.75rem",
    color: "#6b7280",
  } as React.CSSProperties,
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  } as React.CSSProperties,
  statCard: {
    background: "white",
    padding: "1.25rem",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
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

const PauseIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UsersIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// ============================================
// CONSTANTS
// ============================================
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  EXPIRED: "Expirada",
  CANCELLED: "Cancelada",
};

// ============================================
// COMPONENT
// ============================================
export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserMembership[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState("");
  const [pricePaid, setPricePaid] = useState(0);
  const [autoRenew, setAutoRenew] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subsResponse, membsResponse, clientsData] = await Promise.all([
        getUserMemberships({ status: statusFilter || undefined }),
        getMemberships(),
        getClients({ role: "CLIENT" }),
      ]);
      setSubscriptions(subsResponse.userMemberships);
      setMemberships(membsResponse.memberships);
      setClients(clientsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

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

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle create subscription
  const handleOpenModal = () => {
    setSelectedClientId("");
    setSelectedMembershipId("");
    setPricePaid(0);
    setAutoRenew(true);
    setShowModal(true);
    setError(null);
  };

  const handleSelectMembership = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    const m = memberships.find((x) => x.id === membershipId);
    if (m) {
      setPricePaid(m.price / 100);
    }
  };

  const handleSave = async () => {
    if (!selectedClientId || !selectedMembershipId) {
      setError("Selecciona un cliente y una membresía");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createUserMembership({
        userId: selectedClientId,
        membershipId: selectedMembershipId,
        pricePaid: Math.round(pricePaid * 100),
        autoRenew,
      });
      await loadData();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Error creating subscription");
    } finally {
      setSaving(false);
    }
  };

  // Handle status change
  const handlePause = async (id: string) => {
    try {
      await updateUserMembership(id, { status: "PAUSED" });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error pausing subscription");
    }
  };

  const handleResume = async (id: string) => {
    try {
      await updateUserMembership(id, { status: "ACTIVE" });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error resuming subscription");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar esta suscripción?")) return;
    try {
      await updateUserMembership(id, { status: "CANCELLED" });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Error cancelling subscription");
    }
  };

  // Stats
  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const pausedCount = subscriptions.filter((s) => s.status === "PAUSED").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.pricePaid, 0);

  // Render loading
  if (loading && subscriptions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Cargando suscripciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Suscripciones</h1>
          <p style={styles.subtitle}>
            Gestiona las membresías activas de tus clientes
          </p>
        </div>
        <button style={styles.primaryButton} onClick={handleOpenModal}>
          <PlusIcon /> Nueva Suscripción
        </button>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{activeCount}</div>
          <div style={styles.statLabel}>Activas</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{pausedCount}</div>
          <div style={styles.statLabel}>Pausadas</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{formatPrice(totalRevenue)}</div>
          <div style={styles.statLabel}>Ingresos Recurrentes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{subscriptions.length}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.searchBar}>
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="PAUSED">Pausadas</option>
          <option value="EXPIRED">Expiradas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {subscriptions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ margin: "0 auto 1rem", width: "fit-content", color: "#d1d5db" }}>
              <UsersIcon />
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
              Sin suscripciones
            </div>
            <p>Crea una suscripción para vender membresías a tus clientes</p>
            <button
              style={{ ...styles.primaryButton, marginTop: "1rem", display: "inline-flex" }}
              onClick={handleOpenModal}
            >
              <PlusIcon /> Nueva Suscripción
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Membresía</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Sesiones</th>
                <th style={styles.th}>Inicio</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td style={styles.td}>
                    <div style={styles.userName}>{sub.user?.name || "Sin nombre"}</div>
                    <div style={styles.userEmail}>{sub.user?.email}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{sub.membership?.name}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(sub.status)}>
                      {STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {formatPrice(sub.pricePaid)}
                  </td>
                  <td style={styles.td}>
                    {sub.sessionsRemaining !== null ? (
                      <span>
                        {sub.sessionsRemaining} restantes
                        <span style={{ color: "#9ca3af" }}> ({sub.sessionsUsed} usadas)</span>
                      </span>
                    ) : (
                      <span style={{ color: "#059669" }}>Ilimitadas</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {formatDate(sub.startDate)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ ...styles.actions, justifyContent: "flex-end" }}>
                      {sub.status === "ACTIVE" && (
                        <button
                          style={{ ...styles.iconButton, color: "#f59e0b" }}
                          onClick={() => handlePause(sub.id)}
                          title="Pausar"
                        >
                          <PauseIcon />
                        </button>
                      )}
                      {sub.status === "PAUSED" && (
                        <button
                          style={{ ...styles.iconButton, color: "#059669" }}
                          onClick={() => handleResume(sub.id)}
                          title="Reactivar"
                        >
                          <PlayIcon />
                        </button>
                      )}
                      {(sub.status === "ACTIVE" || sub.status === "PAUSED") && (
                        <button
                          style={{ ...styles.iconButton, color: "#ef4444" }}
                          onClick={() => handleCancel(sub.id)}
                          title="Cancelar"
                        >
                          <XIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nueva Suscripción</h2>
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
                <label style={styles.label}>Cliente *</label>
                <select
                  style={styles.select}
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Membresía *</label>
                <div>
                  {memberships.length === 0 ? (
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      No hay membresías disponibles. Crea una primero.
                    </p>
                  ) : (
                    memberships.map((m) => (
                      <div
                        key={m.id}
                        style={
                          selectedMembershipId === m.id
                            ? styles.membershipCardSelected
                            : styles.membershipCard
                        }
                        onClick={() => handleSelectMembership(m.id)}
                      >
                        <div style={styles.membershipName}>{m.name}</div>
                        <div style={styles.membershipDetails}>
                          {formatPrice(m.price)} /{" "}
                          {m.billingCycle === "MONTHLY"
                            ? "mes"
                            : m.billingCycle === "YEARLY"
                            ? "año"
                            : m.billingCycle.toLowerCase()}
                          {m.inscriptionFee > 0 && (
                            <> + {formatPrice(m.inscriptionFee)} inscripción</>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedMembershipId && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Precio Cobrado (MXN)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={pricePaid}
                      onChange={(e) => setPricePaid(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    <p style={styles.helpText}>
                      Puedes ajustar el precio si es diferente al estándar
                    </p>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={autoRenew}
                        onChange={(e) => setAutoRenew(e.target.checked)}
                      />
                      <span>Renovación automática</span>
                    </label>
                  </div>
                </>
              )}
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
                disabled={saving || !selectedClientId || !selectedMembershipId}
              >
                {saving ? "Creando..." : "Crear Suscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
