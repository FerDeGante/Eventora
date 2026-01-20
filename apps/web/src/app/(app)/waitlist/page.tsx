"use client";

import { useState } from "react";
import { WaitlistPanel } from "@/app/components/WaitlistPanel";
import { GlowCard } from "@/app/components/ui/GlowCard";

interface ServiceWithWaitlist {
  id: string;
  name: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  waitlistCount: number;
}

// Mock data for services with waitlists
const mockServicesWithWaitlist: ServiceWithWaitlist[] = [
  {
    id: "SVC-001",
    name: "Yoga matutino",
    date: "2026-01-21",
    time: "08:00",
    capacity: 15,
    booked: 15,
    waitlistCount: 3,
  },
  {
    id: "SVC-002",
    name: "Spinning avanzado",
    date: "2026-01-21",
    time: "18:00",
    capacity: 20,
    booked: 20,
    waitlistCount: 2,
  },
  {
    id: "SVC-003",
    name: "Pilates principiantes",
    date: "2026-01-22",
    time: "10:00",
    capacity: 12,
    booked: 12,
    waitlistCount: 1,
  },
];

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  } as React.CSSProperties,
  statCard: {
    padding: "1.5rem",
    textAlign: "center" as const,
  } as React.CSSProperties,
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  servicesList: {
    display: "grid",
    gap: "1.5rem",
  } as React.CSSProperties,
  serviceCard: {
    padding: "1.5rem",
  } as React.CSSProperties,
  serviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border-color)",
  } as React.CSSProperties,
  serviceInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  } as React.CSSProperties,
  serviceName: {
    fontSize: "1.25rem",
    fontWeight: 600,
  } as React.CSSProperties,
  serviceMeta: {
    fontSize: "0.875rem",
    color: "var(--gray-400)",
  } as React.CSSProperties,
  capacityBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    background: "rgba(239, 68, 68, 0.1)",
    color: "rgb(239, 68, 68)",
    fontWeight: 600,
    fontSize: "0.875rem",
  } as React.CSSProperties,
};

export default function WaitlistManagementPage() {
  const [services] = useState<ServiceWithWaitlist[]>(mockServicesWithWaitlist);
  const [selectedService, setSelectedService] = useState<ServiceWithWaitlist | null>(null);

  const totalWaitlist = services.reduce((sum, service) => sum + service.waitlistCount, 0);
  const fullServices = services.filter((s) => s.booked >= s.capacity).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Listas de Espera</h1>
        <p style={styles.subtitle}>Administra las listas de espera para servicios con capacidad completa</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "var(--orange-500)" }}>{totalWaitlist}</div>
          <div style={styles.statLabel}>Total en espera</div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "var(--red-500)" }}>{fullServices}</div>
          <div style={styles.statLabel}>Servicios llenos</div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "var(--blue-500)" }}>{services.length}</div>
          <div style={styles.statLabel}>Servicios con waitlist</div>
        </div>
      </div>

      {/* Services with Waitlists */}
      <div style={styles.servicesList}>
        {services.map((service) => (
          <div key={service.id} className="glass-panel" style={styles.serviceCard}>
            <div style={styles.serviceHeader}>
              <div style={styles.serviceInfo}>
                <div style={styles.serviceName}>{service.name}</div>
                <div style={styles.serviceMeta}>
                  {formatDate(service.date)} · {service.time} · {service.waitlistCount} en lista de espera
                </div>
              </div>
              <div style={styles.capacityBadge}>
                {service.booked}/{service.capacity} lleno
              </div>
            </div>

            {selectedService?.id === service.id ? (
              <>
                <WaitlistPanel serviceId={service.id} serviceName={service.name} slotTime={`${formatDate(service.date)} ${service.time}`} />
                <button
                  onClick={() => setSelectedService(null)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Ocultar lista
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectedService(service)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Ver lista de espera ({service.waitlistCount})
              </button>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem", color: "var(--gray-600)" }}>No hay servicios con lista de espera</p>
          <p style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Las listas de espera aparecerán aquí cuando un servicio alcance su capacidad máxima
          </p>
        </div>
      )}
    </div>
  );
}
