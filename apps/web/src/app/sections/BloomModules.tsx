"use client";

import { motion } from "framer-motion";
import { GlowCard } from "../components/ui/GlowCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { EventoraButton } from "../components/ui/EventoraButton";

const modules = [
  {
    title: "Command Center",
    copy: "Panel unificado para admins y staff con availability IA, paquetes, marketplace y POS integrado.",
    chips: ["Wizard holográfico", "Paquetes Drag & Drop", "Room view"],
  },
  {
    title: "Payments & POS",
    copy: "Stripe Checkout, Mercado Pago y caja física con impresión de tickets sincronizados.",
    chips: ["Stripe Webhooks", "Mercado Pago", "POS tickets"],
  },
  {
    title: "Notificaciones Resend",
    copy: "Plantillas editables desde el admin: reserva exitosa, recordatorios 24h/1h, seguimiento y descuentos.",
    chips: ["Calendar CTA", "WhatsApp", "Autenticación 2FA"],
  },
  {
    title: "Marketplace público",
    copy: "Landing multi-clínica estilo Chrome/Gemini para captar pacientes y conectar con el wizard.",
    chips: ["Mapa multi-sucursal", "SEO", "Apps cliente"],
  },
];

const marquee = ["Stripe", "Resend", "Mercado Pago", "Google Calendar", "WhatsApp", "Apple Wallet"];

export function EventoraModules() {
  return (
    <section className="section-shell">
      <div className="section-header">
        <SectionHeading eyebrow="Eventora Modules" title="Un ecosistema multi-clínica listo para escalar.">
          Los módulos de Eventora Aura Neo combinan reservaciones, POS, notificaciones y marketing con una experiencia premium.
        </SectionHeading>
        <EventoraButton>Solicitar demo</EventoraButton>
      </div>
      <div className="modules-grid">
        {modules.map((module) => (
          <GlowCard key={module.title} className="modules-card">
            <p className="modules-card__title">{module.title}</p>
            <p className="modules-card__copy">{module.copy}</p>
            <div className="modules-card__chips">
              {module.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </GlowCard>
        ))}
      </div>
      <motion.div className="modules-marquee" initial={{ x: "-10%" }} animate={{ x: "-30%" }} transition={{ repeat: Infinity, duration: 22, ease: "linear" }}>
        {marquee.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </motion.div>
    </section>
  );
}
