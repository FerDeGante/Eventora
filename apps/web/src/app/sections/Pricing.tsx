"use client";

import Link from "next/link";
import styles from "./Pricing.module.css";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      tagline: "Para clínicas con 1 sucursal",
      price: "299",
      period: "/mes",
      description: "Todo lo que necesitas para empezar a escalar",
      features: [
        "Hasta 500 reservas/mes",
        "Agenda inteligente 24/7",
        "Cobros automáticos (Stripe/MP)",
        "Recordatorios multicanal",
        "1 sucursal",
        "Soporte por email"
      ],
      cta: "Empezar ahora",
      highlighted: false
    },
    {
      name: "Growth",
      tagline: "El preferido de clínicas en expansión",
      price: "599",
      period: "/mes",
      description: "Para facturar +$50K mensuales sin estrés",
      features: [
        "Reservas ilimitadas",
        "Hasta 5 sucursales",
        "Marketplace activo",
        "Analytics en tiempo real",
        "Automatizaciones avanzadas",
        "Integración WhatsApp",
        "Onboarding personalizado",
        "Soporte prioritario 24/7"
      ],
      cta: "Agendar demo",
      highlighted: true,
      badge: "Más popular"
    },
    {
      name: "Enterprise",
      tagline: "Para cadenas premium",
      price: "Custom",
      period: "",
      description: "Solución a medida para redes de 6+ sucursales",
      features: [
        "Todo de Growth",
        "Sucursales ilimitadas",
        "API dedicada",
        "White label opcional",
        "Gerente de cuenta dedicado",
        "SLA 99.9%",
        "Capacitación in-situ",
        "Migración asistida"
      ],
      cta: "Contactar ventas",
      highlighted: false
    }
  ];

  return (
    <section className={styles.section} id="precios">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>INVERSIÓN INTELIGENTE</span>
          <h2 className={styles.title}>
            Elige el plan que <span className={styles.gradient}>multiplica tu ROI</span>
          </h2>
          <p className={styles.subtitle}>
            Cada plan incluye todo lo necesario para recuperar tu inversión en menos de 30 días.
            <br />
            Sin contratos anuales. Cancela cuando quieras.
          </p>
        </div>

        <div className={styles.plans}>
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`${styles.plan} ${plan.highlighted ? styles.highlighted : ''}`}
            >
              {plan.badge && (
                <div className={styles.planBadge}>{plan.badge}</div>
              )}
              
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planTagline}>{plan.tagline}</p>
                
                <div className={styles.planPrice}>
                  {plan.price === "Custom" ? (
                    <span className={styles.customPrice}>A tu medida</span>
                  ) : (
                    <>
                      <span className={styles.currency}>$</span>
                      <span className={styles.amount}>{plan.price}</span>
                      <span className={styles.period}>{plan.period}</span>
                    </>
                  )}
                </div>
                
                <p className={styles.planDescription}>{plan.description}</p>
              </div>

              <ul className={styles.planFeatures}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.feature}>
                    <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.highlighted ? "/demo" : "/signup"} 
                className={`${styles.planCta} ${plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.guarantee}>
          <svg className={styles.shieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <strong>Garantía de 30 días</strong>
            <p>Si no recuperas la inversión en el primer mes, te devolvemos el 100%. Sin preguntas.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
