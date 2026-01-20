"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";

interface CreditBalance {
  totalCredits: number;
  availableCredits: number;
  expiringSoon: number;
  expiryDate: string | null;
}

interface CreditMovement {
  id: string;
  date: string;
  type: "purchase" | "usage" | "expiration" | "refund";
  amount: number;
  balance: number;
  description: string;
  service?: string;
  reservation?: string;
}

// Mock data for now (will connect to backend later)
const mockBalance: CreditBalance = {
  totalCredits: 50,
  availableCredits: 42,
  expiringSoon: 8,
  expiryDate: "2026-02-28",
};

const mockMovements: CreditMovement[] = [
  {
    id: "1",
    date: "2026-01-20",
    type: "usage",
    amount: -2,
    balance: 42,
    description: "Sesión de fisioterapia",
    service: "Fisioterapia deportiva",
    reservation: "RES-8725",
  },
  {
    id: "2",
    date: "2026-01-18",
    type: "usage",
    amount: -1,
    balance: 44,
    description: "Hidroterapia",
    service: "Sesión hidroterapia",
    reservation: "RES-8701",
  },
  {
    id: "3",
    date: "2026-01-15",
    type: "purchase",
    amount: 20,
    balance: 45,
    description: "Compra de paquete 20 sesiones",
  },
  {
    id: "4",
    date: "2026-01-10",
    type: "usage",
    amount: -2,
    balance: 25,
    description: "Masaje deportivo",
    service: "Masaje terapéutico",
    reservation: "RES-8650",
  },
  {
    id: "5",
    date: "2026-01-05",
    type: "purchase",
    amount: 10,
    balance: 27,
    description: "Compra de paquete 10 sesiones",
  },
];

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  } as React.CSSProperties,
  header: {
    marginBottom: "2rem",
  } as React.CSSProperties,
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  } as React.CSSProperties,
  balanceCard: {
    textAlign: "center" as const,
    padding: "1.5rem",
  } as React.CSSProperties,
  balanceValue: {
    fontSize: "3rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  balanceLabel: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  filterBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  movementsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  } as React.CSSProperties,
  movementItem: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: "1rem",
    alignItems: "center",
    padding: "1rem",
  } as React.CSSProperties,
  movementDate: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
    minWidth: "100px",
  } as React.CSSProperties,
  movementInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  } as React.CSSProperties,
  movementDescription: {
    fontWeight: 500,
  } as React.CSSProperties,
  movementMeta: {
    fontSize: "0.75rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  movementAmount: (type: string) =>
    ({
      fontSize: "1.125rem",
      fontWeight: 600,
      color:
        type === "purchase" || type === "refund"
          ? "var(--green-500)"
          : type === "expiration"
          ? "var(--red-500)"
          : "var(--gray-600)",
    } as React.CSSProperties),
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem 1rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
};

export default function WalletPage() {
  const [balance] = useState<CreditBalance>(mockBalance);
  const [movements] = useState<CreditMovement[]>(mockMovements);
  const [filter, setFilter] = useState<"all" | "purchase" | "usage" | "expiration" | "refund">("all");

  const filteredMovements = movements.filter((m) => filter === "all" || m.type === filter);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: "Compra",
      usage: "Uso",
      expiration: "Expiración",
      refund: "Reembolso",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Balance de Créditos</h1>
        <p style={styles.subtitle}>Consulta tu saldo disponible y el historial de movimientos de tus créditos</p>
      </div>

      {/* Balance Cards */}
      <div style={styles.balanceGrid}>
        <div className="glass-panel" style={styles.balanceCard}>
          <div style={{ ...styles.balanceValue, color: "var(--purple-500)" }}>{balance.availableCredits}</div>
          <div style={styles.balanceLabel}>Créditos disponibles</div>
        </div>

        <div className="glass-panel" style={styles.balanceCard}>
          <div style={{ ...styles.balanceValue, color: "var(--blue-500)" }}>{balance.totalCredits}</div>
          <div style={styles.balanceLabel}>Total de créditos</div>
        </div>

        <div className="glass-panel" style={styles.balanceCard}>
          <div style={{ ...styles.balanceValue, color: balance.expiringSoon > 0 ? "var(--orange-500)" : "var(--green-500)" }}>
            {balance.expiringSoon}
          </div>
          <div style={styles.balanceLabel}>
            {balance.expiringSoon > 0 ? `Expiran el ${formatDate(balance.expiryDate!)}` : "Sin créditos por expirar"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <EventoraButton variant={filter === "all" ? "primary" : "ghost"} onClick={() => setFilter("all")}>
          Todos
        </EventoraButton>
        <EventoraButton variant={filter === "purchase" ? "primary" : "ghost"} onClick={() => setFilter("purchase")}>
          Compras
        </EventoraButton>
        <EventoraButton variant={filter === "usage" ? "primary" : "ghost"} onClick={() => setFilter("usage")}>
          Usos
        </EventoraButton>
        <EventoraButton variant={filter === "expiration" ? "primary" : "ghost"} onClick={() => setFilter("expiration")}>
          Expiraciones
        </EventoraButton>
        <EventoraButton variant={filter === "refund" ? "primary" : "ghost"} onClick={() => setFilter("refund")}>
          Reembolsos
        </EventoraButton>
      </div>

      {/* Movements List */}
      <GlowCard>
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Historial de Movimientos</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
            {filteredMovements.length} movimientos
          </p>
        </div>

        {filteredMovements.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>No hay movimientos</p>
            <p style={{ fontSize: "0.875rem" }}>No se encontraron movimientos con los filtros seleccionados</p>
          </div>
        ) : (
          <div style={styles.movementsList}>
            {filteredMovements.map((movement) => (
              <div key={movement.id} className="glass-panel" style={styles.movementItem}>
                <div style={styles.movementDate}>{formatDate(movement.date)}</div>

                <div style={styles.movementInfo}>
                  <div style={styles.movementDescription}>{movement.description}</div>
                  <div style={styles.movementMeta}>
                    {getTypeLabel(movement.type)}
                    {movement.service && ` · ${movement.service}`}
                    {movement.reservation && ` · ${movement.reservation}`}
                  </div>
                </div>

                <div>
                  <div style={styles.movementAmount(movement.type)}>
                    {movement.amount > 0 ? "+" : ""}
                    {movement.amount} créditos
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "right" }}>
                    Balance: {movement.balance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlowCard>

      {/* CTA for empty state */}
      {balance.availableCredits === 0 && (
        <div className="glass-panel" style={{ marginTop: "2rem", padding: "2rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Sin créditos disponibles</h3>
          <p style={{ color: "var(--gray-400)", marginBottom: "1.5rem" }}>
            Compra un paquete de sesiones para empezar a usar tus créditos
          </p>
          <EventoraButton>Comprar paquete</EventoraButton>
        </div>
      )}
    </div>
  );
}
