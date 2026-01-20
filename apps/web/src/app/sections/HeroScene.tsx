"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { EventoraButton } from "../components/ui/EventoraButton";
import { GlowCard } from "../components/ui/GlowCard";
import { KpiBar } from "../components/ui/KpiBar";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useEventoraTheme } from "../providers";
import { useLandingMetrics } from "../hooks/useLandingMetrics";
import "../styles/hero-sections.css";

const heroPillDefaults = ["Paquetes inteligentes", "Stripe + Mercado Pago", "WhatsApp + Resend", "POS omnicanal"];

const featureCards = [
  { title: "Command Center", copy: "Timeline vivo, staff y salas con disponibilidad IA." },
  { title: "Pagos sincronizados", copy: "Stripe, Mercado Pago y POS físico sin fricción." },
  { title: "Notificaciones Eventora", copy: "Resend, WhatsApp y Calendar listos para plantillas premium." },
];

const aiFeatures = [
  { icon: "✨", title: "Disponibilidad inteligente", copy: "Optimiza salas, recursos y terapeutas en segundos." },
  { icon: "🤖", title: "Alertas contextuales", copy: "Recordatorios 24h/1h, seguimiento y 2FA con Resend." },
  { icon: "📊", title: "Insights accionables", copy: "KPIs por sucursal con recomendaciones IA integradas." },
];

const packages = [
  {
    name: "Essential",
    price: "$0",
    period: "/mes",
    description: "Para clínicas en lanzamiento que buscan digitalizar reservas.",
    features: ["Agenda multi-sucursal", "Checkout Stripe", "Recordatorios email", "Analytics básicos"],
  },
  {
    name: "Professional",
    highlight: true,
    price: "$149",
    period: "/mes",
    description: "Todo el motor Eventora listo para operaciones y POS omnicanal.",
    features: ["POS + tickets", "Mercado Pago", "Automations WhatsApp", "Marketplace público", "Paquetes/membresías"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Redes multicentro, SLA dedicado e integraciones personalizadas.",
    features: ["Integraciones personalizadas", "Soporte 24/7", "Módulos a medida", "SLA garantizado"],
  },
];

const socialLinks = [
  { name: "Behance", href: "https://behance.net" },
  { name: "Dribbble", href: "https://dribbble.com" },
  { name: "Twitter", href: "https://twitter.com" },
  { name: "LinkedIn", href: "https://linkedin.com" },
];

const orbitVariants = {
  animate: (delay: number) => ({
    rotate: 360,
    transition: { repeat: Infinity, ease: "linear", duration: 28, delay },
  }),
};

export function HeroScene() {
  const router = useRouter();
  const { theme, toggleTheme } = useEventoraTheme();
  const { stats, statusMessage, isLive } = useLandingMetrics();
  const heroPills = heroPillDefaults;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.7]);
  const badgeTicker = useMemo(() => `${heroPills.join(" • ")} • `, [heroPills]);

  return (
    <div ref={containerRef} className="hero-container">
      <section className="hero hero-shell">
        <span className="bloom-grid" aria-hidden />
        <motion.div className="hero-left" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div className="hero-badge hero-badge-ticker" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <span>{badgeTicker}</span>
            <span aria-hidden>{badgeTicker}</span>
          </motion.div>
          <div className="hero-theme-toggle">
            <button onClick={toggleTheme}>{theme === "dark" ? "Modo Aurora" : "Modo Nebula"}</button>
            <span>Eventora · {statusMessage}</span>
          </div>
          <SectionHeading eyebrow="Eventora Clinics" title="El sistema operativo premium para clínicas de salud sensorial.">
            Reservaciones multicentro, POS omnicanal, marketplace y automatizaciones Resend estilo Chrome/Gemini.
          </SectionHeading>
          <div className="hero-pill-row">
            {heroPills.map((pill, i) => (
              <motion.span key={pill} className="hero-pill ticker-gradient" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                {pill}
              </motion.span>
            ))}
          </div>
          <div className="hero-cta">
            <EventoraButton onClick={() => router.push("/dashboard")}>Ir al panel</EventoraButton>
            <EventoraButton variant="ghost" onClick={() => router.push("/marketplace")}>
              Explorar experiencia pública
            </EventoraButton>
          </div>
          <KpiBar stats={stats} />
        </motion.div>
        <div className="hero-right">
          <motion.div className="hero-orbit hero-orbit-base" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} />
          {[0, 0.6, 1.2].map((delay, index) => (
            <motion.div key={delay} className={`hero-orbit hero-orbit-ring hero-orbit-${index}`} custom={delay} variants={orbitVariants} animate="animate" />
          ))}
          <GlowCard className="hero-command-center">
            <p className="hero-card-title">Reservas sincronizadas</p>
            <p className="hero-card-highlight">Experiencia holográfica</p>
            <p className="hero-card-copy">Línea de tiempo viva, paquetes, POS y recordatorios Resend coordinados automáticamente.</p>
            <div className="hero-card-status">
              <span className="hero-card-dot" /> {isLive ? "Stripe Webhooks activos" : "Modo offline"}
            </div>
            <div className="hero-command-tags">
              <span>Tickets POS</span>
              <span>WhatsApp alerts</span>
              <span>Room view</span>
            </div>
          </GlowCard>
          <motion.div className="hero-feature-grid" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}>
            {featureCards.map((card) => (
              <GlowCard key={card.title} className="hero-feature-card">
                <p className="hero-feature-title">{card.title}</p>
                <p className="hero-feature-copy">{card.copy}</p>
              </GlowCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bloom-section bloom-section-ai" id="ia">
        <div className="bloom-section-content">
          <motion.div className="bloom-section-text" initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="bloom-section-title">Crea experiencias personalizadas con IA</h2>
            <p className="bloom-section-description">
              Nuestro motor aprende de cada sesión para sugerir disponibilidad, mensajes y promociones hiper relevantes para tus pacientes.
            </p>
            <div className="bloom-section-features">
              {aiFeatures.map((feature) => (
                <div key={feature.title} className="bloom-feature-item">
                  <div className="bloom-feature-icon">{feature.icon}</div>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bloom-section-visual bloom-visual-orb" initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
            <div className="bloom-orb-core" />
            <div className="bloom-orb-ring bloom-orb-ring-1" />
            <div className="bloom-orb-ring bloom-orb-ring-2" />
          </motion.div>
        </div>
      </section>

      <section className="bloom-section bloom-section-stripe" id="payments">
        <div className="bloom-section-content bloom-section-reverse">
          <motion.div className="bloom-section-visual" initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bloom-payment-mockup">
              <div className="bloom-card-float">
                <div className="bloom-credit-card">
                  <div className="bloom-card-chip" />
                  <div>
                    <p className="bloom-card-number">5246 •••• •••• 1894</p>
                    <p className="bloom-card-name">Eventora Clinics</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div className="bloom-section-text" initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="bloom-section-title">Pagos sin fricción con Stripe + Mercado Pago</h2>
            <p className="bloom-section-description">
              Checkout, suscripciones, POS físico y reconciliación automática en un solo panel. Los webhooks coordinan recordatorios, wallet y contabilidad.
            </p>
            <div className="bloom-stats-row">
              <div className="bloom-stat">
                <div className="bloom-stat-value">99.9%</div>
                <div className="bloom-stat-label">Éxito de cobros</div>
              </div>
              <div className="bloom-stat">
                <div className="bloom-stat-value">+45%</div>
                <div className="bloom-stat-label">Paquetes Eventora+</div>
              </div>
              <div className="bloom-stat">
                <div className="bloom-stat-value">2s</div>
                <div className="bloom-stat-label">Tickets POS</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bloom-section bloom-section-packages" id="pricing">
        <motion.div className="bloom-section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="bloom-section-title-center">Elige el plan perfecto para tu clínica</h2>
          <p className="bloom-section-subtitle">Desde startups hasta redes multi-sucursal. Sin costos ocultos.</p>
        </motion.div>
        <div className="bloom-packages-grid">
          {packages.map((pkg) => (
            <GlowCard key={pkg.name} className={`bloom-package-card ${pkg.highlight ? "bloom-package-highlight" : ""}`}>
              {pkg.highlight && <div className="bloom-package-badge">Más popular</div>}
              <div className="bloom-package-header">
                <h3 className="bloom-package-name">{pkg.name}</h3>
                <div className="bloom-package-price">
                  {pkg.price}
                  <span className="bloom-package-period">{pkg.period}</span>
                </div>
                <p className="bloom-package-description">{pkg.description}</p>
              </div>
              <ul className="bloom-package-features">
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <span className="bloom-feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <EventoraButton variant={pkg.highlight ? "primary" : "ghost"} onClick={() => router.push(pkg.price === "Custom" ? "/contact" : "/register")}>
                {pkg.price === "Custom" ? "Contactar ventas" : "Empezar ahora"}
              </EventoraButton>
            </GlowCard>
          ))}
        </div>
      </section>

      <footer className="bloom-footer">
        <div className="bloom-footer-content">
          <div className="bloom-footer-main">
            <div className="bloom-footer-brand">
              <h3 className="bloom-footer-logo">Eventora</h3>
              <p className="bloom-footer-tagline">
                Plataforma SaaS premium para clínicas de salud sensorial. Inspirada en la estética de Chrome & Gemini.
              </p>
              <div className="bloom-footer-social">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.href} className="bloom-social-link">
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="bloom-footer-links">
              <div className="bloom-footer-column">
                <h4>Producto</h4>
                <a href="#features">Características</a>
                <a href="#pricing">Precios</a>
                <a href="#payments">Pagos</a>
                <a href="#marketplace">Marketplace</a>
              </div>
              <div className="bloom-footer-column">
                <h4>Recursos</h4>
                <a href="#docs">Documentación</a>
                <a href="#api">API Reference</a>
                <a href="#guides">Guías</a>
                <a href="#support">Soporte</a>
              </div>
              <div className="bloom-footer-column">
                <h4>Empresa</h4>
                <a href="#about">Nosotros</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contacto</a>
              </div>
              <div className="bloom-footer-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacidad</a>
                <a href="#terms">Términos</a>
                <a href="#security">Seguridad</a>
                <a href="#compliance">Compliance</a>
              </div>
            </div>
          </div>
          <div className="bloom-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Eventora. Diseñado en Barcelona con 💜</p>
            <div className="bloom-footer-badges">
              <span className="bloom-badge">SOC 2</span>
              <span className="bloom-badge">GDPR Ready</span>
              <span className="bloom-badge">ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
