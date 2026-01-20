import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { KpiBar } from "@/app/components/ui/KpiBar";
import { getDashboardOverview, getPosTickets, type DashboardOverviewResponse } from "@/lib/admin-api";
import { OnboardingPanel } from "@/app/components/OnboardingPanel";
import { DaySheetContainer } from "@/app/components/DaySheetContainer";

const fallbackData: DashboardOverviewResponse = {
  stats: [
    { label: "Reservas hoy", value: "86", delta: "+14% vs ayer" },
    { label: "Ingreso proyectado", value: "$186K MXN", delta: "Stripe · POS" },
    { label: "Planes activos", value: "312", delta: "Paquetes Eventora+" },
  ],
  timeline: [
    {
      id: "RES-8721",
      time: "08:30",
      patient: "Sofía Núñez",
      service: "Sesión hidroterapia",
      therapist: "Camila R.",
      branch: "Polanco",
      status: "checked_in",
    },
    {
      id: "RES-8722",
      time: "09:15",
      patient: "Carlos López",
      service: "Fisioterapia deportiva",
      therapist: "Marco T.",
      branch: "Roma",
      status: "scheduled",
    },
    {
      id: "RES-8723",
      time: "10:00",
      patient: "Paulina Aguilar",
      service: "Spa - Drenaje linfático",
      therapist: "Abril S.",
      branch: "Coyoacán",
      status: "scheduled",
    },
    {
      id: "RES-8724",
      time: "11:30",
      patient: "Jorge Mejía",
      service: "Rehab post-operatoria",
      therapist: "Dr. Pérez",
      branch: "Polanco",
      status: "completed",
    },
  ],
  webhooks: [
    { provider: "Stripe", status: "operational", lastEvent: "payment_intent.succeeded · hace 4m" },
    { provider: "Resend", status: "scheduled", lastEvent: "Reserva exitosa · hace 2m" },
    { provider: "Mercado Pago", status: "standby", lastEvent: "pending configuration" },
  ],
  notifications: [
    { template: "Reserva exitosa", channel: "email", status: "activo", schedule: "inmediato" },
    { template: "Recordatorio 24h", channel: "email + whatsapp", status: "activo", schedule: "24h antes" },
    { template: "Recordatorio 1h", channel: "sms", status: "activo", schedule: "1h antes" },
    { template: "Seguimiento bloom+", channel: "email", status: "borrador" },
    { template: "Código de descuento", channel: "email", status: "activo" },
  ],
  posQueue: [
    { id: "POS-1029", branch: "Polanco", total: "$3,240 MXN", status: "impresora lista" },
    { id: "POS-1030", branch: "Roma", total: "$1,180 MXN", status: "cobrando" },
  ],
};

async function getDashboardData(): Promise<{ payload: DashboardOverviewResponse; isFallback: boolean }> {
  try {
    const data = await getDashboardOverview();
    if (!data.stats?.length) throw new Error("Empty payload");
    return { payload: data, isFallback: Boolean(data.fallback) };
  } catch (error) {
    console.error("[dashboard] falling back to mock data", error);
    return { payload: fallbackData, isFallback: true };
  }
}

export default async function DashboardPage() {
  const [{ payload: data, isFallback }, posTickets] = await Promise.all([getDashboardData(), getPosTickets().catch(() => [])]);

  return (
    <div className="dashboard-grid">
      <p className={`dashboard-status ${isFallback ? "is-fallback" : ""}`}>
        {isFallback ? "Eventora OS: sincronizando API · mostrando datos locales" : "Eventora OS: datos en vivo desde API v1"}
      </p>
      <section className="dashboard-panel glass-panel">
        <SectionHeading eyebrow="Eventora Pulse" title="Disponibilidad y revenue en tiempo real">
          Conecta Stripe, POS y paquetes para sincronizar reservas y monitorear el experience score.
        </SectionHeading>
        <KpiBar stats={data.stats} />
        <DaySheetContainer initialTimeline={data.timeline} isFallback={isFallback} />
      </section>
      <section className="dashboard-panel glass-panel">
        <SectionHeading eyebrow="Automation Hub" title="Integraciones críticas al día">
          Stripe webhooks, Resend plantillas y Mercado Pago alineados con Eventora.
        </SectionHeading>
        <div className="dashboard-integrations">
          {data.webhooks.map((hook) => (
            <GlowCard key={hook.provider}>
              <p className="dashboard-integrations__provider">{hook.provider}</p>
              <p className={`dashboard-integrations__status status-${hook.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {hook.status}
              </p>
              <p className="dashboard-integrations__event">{hook.lastEvent}</p>
            </GlowCard>
          ))}
        </div>
        <div className="dashboard-notifications">
          <p className="dashboard-notifications__title">Plantillas Resend / WhatsApp</p>
          <ul>
            {data.notifications.map((template) => (
              <li key={template.template}>
                <span>{template.template}</span>
                <span>{template.channel}</span>
                <span className="dashboard-pill">{template.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="dashboard-side">
        <GlowCard>
          <p className="dashboard-side__title">Cinta POS</p>
          <ul className="dashboard-pos">
            {(posTickets.length ? posTickets : data.posQueue).map((ticket) => (
              <li key={ticket.id}>
                <div>
                  <p>{ticket.id}</p>
                  <span>{ticket.branch}</span>
                </div>
                <div>
                  <p>{ticket.total}</p>
                  <span>{ticket.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </GlowCard>
        <GlowCard>
          <p className="dashboard-side__title">Templates destacados</p>
          <p className="dashboard-side__copy">
            Edita avisos, recordatorios y tickets desde el panel admin con el editor Eventora Aura.
          </p>
          <ul className="dashboard-side__list">
            <li>Reserva exitosa con CTA Calendar</li>
            <li>Recordatorio 24h + 1h</li>
            <li>Seguimiento “Vuelve a Eventora”</li>
            <li>Códigos de descuento / referidos</li>
            <li>Notificación admin/staff instantánea</li>
          </ul>
        </GlowCard>
        <OnboardingPanel />
      </div>
    </div>
  );
}
