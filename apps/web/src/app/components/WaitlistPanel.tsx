"use client";

import { useState } from "react";
import { GlowCard } from "./ui/GlowCard";
import { EventoraButton } from "./ui/EventoraButton";

interface WaitlistEntry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  addedAt: string;
  status: "waiting" | "notified" | "confirmed" | "expired";
  priority: number;
}

interface WaitlistPanelProps {
  serviceId?: string;
  serviceName?: string;
  slotTime?: string;
  onAddToWaitlist?: (clientEmail: string, clientName: string, clientPhone?: string) => Promise<void>;
  onNotify?: (entryId: string) => Promise<void>;
  onRemove?: (entryId: string) => Promise<void>;
}

// Mock data for now (will connect to backend later)
const mockWaitlist: WaitlistEntry[] = [
  {
    id: "W-001",
    clientName: "María González",
    clientEmail: "maria@example.com",
    clientPhone: "+52 55 1234 5678",
    addedAt: "2026-01-20T10:30:00Z",
    status: "waiting",
    priority: 1,
  },
  {
    id: "W-002",
    clientName: "Carlos Ramírez",
    clientEmail: "carlos@example.com",
    addedAt: "2026-01-20T11:15:00Z",
    status: "waiting",
    priority: 2,
  },
  {
    id: "W-003",
    clientName: "Ana López",
    clientEmail: "ana@example.com",
    clientPhone: "+52 55 9876 5432",
    addedAt: "2026-01-20T12:00:00Z",
    status: "notified",
    priority: 3,
  },
];

const styles = {
  container: {
    padding: "1rem",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  } as React.CSSProperties,
  title: {
    fontSize: "1.125rem",
    fontWeight: 600,
  } as React.CSSProperties,
  subtitle: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  } as React.CSSProperties,
  entry: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: "1rem",
    alignItems: "center",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--border-color)",
  } as React.CSSProperties,
  priority: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "0.875rem",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
  } as React.CSSProperties,
  clientInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  } as React.CSSProperties,
  clientName: {
    fontWeight: 500,
  } as React.CSSProperties,
  clientMeta: {
    fontSize: "0.75rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  statusBadge: (status: string) =>
    ({
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 500,
      background:
        status === "waiting"
          ? "rgba(59, 130, 246, 0.1)"
          : status === "notified"
          ? "rgba(251, 191, 36, 0.1)"
          : status === "confirmed"
          ? "rgba(34, 197, 94, 0.1)"
          : "rgba(156, 163, 175, 0.1)",
      color:
        status === "waiting"
          ? "rgb(59, 130, 246)"
          : status === "notified"
          ? "rgb(251, 191, 36)"
          : status === "confirmed"
          ? "rgb(34, 197, 94)"
          : "rgb(156, 163, 175)",
    } as React.CSSProperties),
  actions: {
    display: "flex",
    gap: "0.5rem",
  } as React.CSSProperties,
  form: {
    display: "grid",
    gap: "1rem",
    marginBottom: "1rem",
  } as React.CSSProperties,
  input: {
    padding: "0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid var(--border-color)",
    background: "var(--glass-bg)",
    fontSize: "0.875rem",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    padding: "2rem 1rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
};

export function WaitlistPanel({ serviceId, serviceName, slotTime, onAddToWaitlist, onNotify, onRemove }: WaitlistPanelProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAddToWaitlist = async () => {
    if (!formData.name || !formData.email) {
      alert("Nombre y email son requeridos");
      return;
    }

    setLoading(true);
    try {
      if (onAddToWaitlist) {
        await onAddToWaitlist(formData.email, formData.name, formData.phone || undefined);
      }

      // Add to local state (mock)
      const newEntry: WaitlistEntry = {
        id: `W-${String(waitlist.length + 1).padStart(3, "0")}`,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone || undefined,
        addedAt: new Date().toISOString(),
        status: "waiting",
        priority: waitlist.length + 1,
      };
      setWaitlist([...waitlist, newEntry]);

      // Reset form
      setFormData({ name: "", email: "", phone: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      alert("Error al agregar a lista de espera");
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (entryId: string) => {
    setLoading(true);
    try {
      if (onNotify) {
        await onNotify(entryId);
      }
      setWaitlist((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, status: "notified" as const } : entry)));
    } catch (error) {
      console.error("Error notifying:", error);
      alert("Error al notificar");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    if (!confirm("¿Remover de lista de espera?")) return;

    setLoading(true);
    try {
      if (onRemove) {
        await onRemove(entryId);
      }
      setWaitlist((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (error) {
      console.error("Error removing:", error);
      alert("Error al remover");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      waiting: "En espera",
      notified: "Notificado",
      confirmed: "Confirmado",
      expired: "Expirado",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass-panel" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Lista de Espera</h3>
          {(serviceName || slotTime) && (
            <p style={styles.subtitle}>
              {serviceName}
              {slotTime && ` · ${slotTime}`}
            </p>
          )}
        </div>
        <EventoraButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancelar" : "+ Agregar"}
        </EventoraButton>
      </div>

      {showAddForm && (
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={styles.input}
          />
          <EventoraButton onClick={handleAddToWaitlist} disabled={loading}>
            {loading ? "Agregando..." : "Agregar a lista"}
          </EventoraButton>
        </div>
      )}

      {waitlist.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Sin entradas en lista de espera</p>
          <p style={{ fontSize: "0.875rem" }}>Agrega clientes cuando el servicio esté lleno</p>
        </div>
      ) : (
        <div style={styles.list}>
          {waitlist.map((entry) => (
            <div key={entry.id} style={styles.entry}>
              <div style={styles.priority}>{entry.priority}</div>

              <div style={styles.clientInfo}>
                <div style={styles.clientName}>{entry.clientName}</div>
                <div style={styles.clientMeta}>
                  {entry.clientEmail}
                  {entry.clientPhone && ` · ${entry.clientPhone}`}
                  <br />
                  Agregado: {formatDate(entry.addedAt)}
                </div>
              </div>

              <div style={styles.actions}>
                <div style={styles.statusBadge(entry.status)}>{getStatusLabel(entry.status)}</div>

                {entry.status === "waiting" && (
                  <>
                    <EventoraButton onClick={() => handleNotify(entry.id)} disabled={loading}>
                      Notificar
                    </EventoraButton>
                    <EventoraButton
                      variant="ghost"
                      onClick={() => handleRemove(entry.id)}
                      disabled={loading}
                    >
                      Remover
                    </EventoraButton>
                  </>
                )}

                {entry.status === "notified" && (
                  <EventoraButton
                    variant="ghost"
                    onClick={() => handleRemove(entry.id)}
                    disabled={loading}
                  >
                    Remover
                  </EventoraButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
