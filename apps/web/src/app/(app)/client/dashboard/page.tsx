"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CreditCard, User, FileText } from "react-feather";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import { useAuth } from "@/app/hooks/useAuth";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Mock data for now - will be replaced with real API calls
  const upcomingAppointments = [
    {
      id: "apt-1",
      service: "Hidroterapia sensorial",
      therapist: "Camila R.",
      date: "2026-01-25",
      time: "10:00",
      branch: "Eventora Polanco",
      status: "confirmed",
    },
    {
      id: "apt-2",
      service: "Spa sensorial",
      therapist: "Marco T.",
      date: "2026-02-01",
      time: "14:30",
      branch: "Eventora Roma",
      status: "confirmed",
    },
  ];

  const credits = {
    balance: 5,
    expiresAt: "2026-06-30",
  };

  const membershipStatus = {
    active: true,
    plan: "Eventora Plus",
    validUntil: "2026-12-31",
  };

  return (
    <div className="client-dashboard">
      <SectionHeading 
        eyebrow={`Hola, ${user?.name || "Cliente"}`} 
        title="Tu Portal Eventora"
      >
        Gestiona tus citas, membresías y créditos en un solo lugar.
      </SectionHeading>

      {/* Quick Stats */}
      <section className="client-stats">
        <GlowCard>
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Próximas citas</span>
              <span className="stat-value">{upcomingAppointments.length}</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="stat-card">
            <div className="stat-icon">
              <CreditCard size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Créditos</span>
              <span className="stat-value">{credits.balance}</span>
              <span className="stat-meta">Vencen: {new Date(credits.expiresAt).toLocaleDateString("es-MX")}</span>
            </div>
          </div>
        </GlowCard>

        {membershipStatus.active && (
          <GlowCard>
            <div className="stat-card">
              <div className="stat-icon">
                <User size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Membresía</span>
                <span className="stat-value">{membershipStatus.plan}</span>
                <span className="stat-meta">Activa hasta {new Date(membershipStatus.validUntil).toLocaleDateString("es-MX")}</span>
              </div>
            </div>
          </GlowCard>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section className="upcoming-section">
        <div className="section-header">
          <h2>Próximas citas</h2>
          <EventoraButton variant="ghost" onClick={() => router.push("/client/appointments")}>
            Ver historial
          </EventoraButton>
        </div>

        <div className="appointments-list">
          {upcomingAppointments.length === 0 ? (
            <GlowCard>
              <div className="empty-state">
                <Calendar size={48} />
                <p>No tienes citas programadas</p>
                <EventoraButton onClick={() => router.push("/wizard")}>
                  Reservar ahora
                </EventoraButton>
              </div>
            </GlowCard>
          ) : (
            upcomingAppointments.map((apt) => (
              <GlowCard key={apt.id}>
                <div className="appointment-card">
                  <div className="appointment-header">
                    <h3>{apt.service}</h3>
                    <span className={`status-badge status-${apt.status}`}>
                      {apt.status === "confirmed" ? "Confirmada" : apt.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p>
                      <Clock size={16} />
                      {new Date(apt.date).toLocaleDateString("es-MX", { 
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })} a las {apt.time}
                    </p>
                    <p>
                      <User size={16} />
                      {apt.therapist} • {apt.branch}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    <EventoraButton 
                      variant="ghost" 
                      onClick={() => router.push(`/client/appointments/${apt.id}/reschedule`)}
                    >
                      Reagendar
                    </EventoraButton>
                    <EventoraButton 
                      variant="ghost"
                      onClick={() => {
                        if (confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
                          // TODO: Call cancel API
                          alert("Cita cancelada (funcionalidad pendiente)");
                        }
                      }}
                    >
                      Cancelar
                    </EventoraButton>
                    <EventoraButton onClick={() => router.push(`/client/receipts/${apt.id}`)}>
                      <FileText size={16} />
                      Recibo
                    </EventoraButton>
                  </div>
                </div>
              </GlowCard>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Acciones rápidas</h2>
        <div className="actions-grid">
          <GlowCard onClick={() => router.push("/wizard")}>
            <Calendar size={32} />
            <h3>Nueva reserva</h3>
            <p>Agenda una nueva cita</p>
          </GlowCard>
          <GlowCard onClick={() => router.push("/client/profile")}>
            <User size={32} />
            <h3>Mi perfil</h3>
            <p>Actualiza tu información</p>
          </GlowCard>
          <GlowCard onClick={() => router.push("/wallet")}>
            <CreditCard size={32} />
            <h3>Mi wallet</h3>
            <p>Ver créditos y movimientos</p>
          </GlowCard>
          <GlowCard onClick={() => router.push("/client/appointments")}>
            <FileText size={32} />
            <h3>Historial</h3>
            <p>Ver citas anteriores</p>
          </GlowCard>
        </div>
      </section>

      <style jsx>{`
        .client-dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .client-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light, #818cf8));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-meta {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .appointment-card {
          padding: 1.5rem;
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .appointment-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-confirmed {
          background: #10b98120;
          color: #10b981;
        }

        .appointment-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .appointment-details p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .appointment-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
        }

        .quick-actions h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .actions-grid :global(.glow-card) {
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .actions-grid :global(.glow-card):hover {
          transform: translateY(-4px);
        }

        .actions-grid h3 {
          margin: 1rem 0 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .actions-grid p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .client-stats {
            grid-template-columns: 1fr;
          }

          .appointment-actions {
            flex-direction: column;
          }

          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
