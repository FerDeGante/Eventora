"use client";

import { useState } from "react";
import styles from "./Testimonials.module.css";

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "Pasamos de contestar 200 WhatsApps diarios a cero. Nuestras 3 sucursales operan con el mismo equipo y facturamos 3.2x más. Eventora no es un software, es un cambio de vida.",
      author: "María González",
      role: "Fundadora",
      company: "Spa Zen - 3 sucursales",
      image: "💆‍♀️",
      metrics: "3.2x facturación · 15hrs recuperadas",
      color: "#38BDF8"
    },
    {
      quote: "Dudaba si valía la pena. En 48 horas estábamos operando. Primer mes: 40% más de reservas. Segundo mes: recuperamos la inversión completa. Tercer mes: abrimos la cuarta sucursal.",
      author: "Carlos Mendoza",
      role: "Director",
      company: "Clínica Vital - 4 sucursales",
      image: "⚕️",
      metrics: "40% más reservas · ROI 30 días",
      color: "#6366F1"
    },
    {
      quote: "Lo que más me impactó fue el marketplace. Clientes nuevos llegan solos. No invertimos en ads y crecimos 180% en 6 meses. El sistema se paga solo.",
      author: "Ana Ruiz",
      role: "CEO",
      company: "Wellness Center Premium",
      image: "🧘‍♀️",
      metrics: "180% crecimiento · $0 en ads",
      color: "#EC4899"
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>TRANSFORMACIONES REALES</span>
          <h2 className={styles.title}>
            Dejaron el caos. <span className={styles.gradient}>Encontraron libertad.</span>
          </h2>
          <p className={styles.subtitle}>
            Estas son las historias de dueños que decidieron dejar de trabajar EN su negocio
            <br />
            para empezar a trabajar SOBRE él.
          </p>
        </div>

        <div className={styles.testimonials}>
          <div className={styles.mainTestimonial}>
            <div 
              className={styles.testimonialCard}
              style={{ '--accent-color': testimonials[activeIndex].color } as React.CSSProperties}
            >
              <div className={styles.quoteIcon}>"</div>
              
              <blockquote className={styles.quote}>
                {testimonials[activeIndex].quote}
              </blockquote>

              <div className={styles.author}>
                <div className={styles.authorAvatar}>
                  <span className={styles.authorEmoji}>{testimonials[activeIndex].image}</span>
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonials[activeIndex].author}</div>
                  <div className={styles.authorRole}>{testimonials[activeIndex].role}</div>
                  <div className={styles.authorCompany}>{testimonials[activeIndex].company}</div>
                </div>
              </div>

              <div className={styles.metrics}>
                {testimonials[activeIndex].metrics}
              </div>
            </div>
          </div>

          <div className={styles.navigation}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.navDot} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Social Proof Numbers */}
        <div className={styles.socialProof}>
          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>120+</div>
            <div className={styles.proofLabel}>Clínicas transformadas</div>
          </div>
          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>$8.2M</div>
            <div className={styles.proofLabel}>Facturados en 2024</div>
          </div>
          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>4.9/5</div>
            <div className={styles.proofLabel}>Rating promedio</div>
          </div>
          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>98%</div>
            <div className={styles.proofLabel}>Renuevan cada año</div>
          </div>
        </div>
      </div>
    </section>
  );
}
