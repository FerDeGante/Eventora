"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ExperienceShowcase.module.css";

export function ExperienceShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const features = [
    { 
      icon: "🗓️", 
      title: "+40 reservas diarias",
      description: "Sin contestar un solo WhatsApp. Tus clientes aman la autonomía.",
      color: "#38BDF8",
      position: "top-left"
    },
    { 
      icon: "💳", 
      title: "$180K cobrados",
      description: "En piloto automático. Confirmación al instante, cero errores.",
      color: "#6366F1",
      position: "top-right"
    },
    { 
      icon: "📧", 
      title: "92% de asistencia",
      description: "Vs. 67% antes de automatizar. Cada silla ocupada es dinero.",
      color: "#EC4899",
      position: "bottom-left"
    },
    { 
      icon: "📊", 
      title: "Decisiones en segundos",
      description: "Qué terapeuta vende más, qué servicio duplicar. Datos, no intuición.",
      color: "#F97316",
      position: "bottom-right"
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular progreso cuando la sección está en viewport
      const start = windowHeight * 0.7;
      const end = windowHeight * 0.3;
      
      if (rect.top <= start && rect.bottom >= end) {
        const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
        setScrollProgress(progress);
      } else if (rect.top > start) {
        setScrollProgress(0);
      } else if (rect.bottom < end) {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        {/* Left Column - Text */}
        <div className={styles.leftColumn}>
          <div className="badge">EL MOMENTO DEL CAMBIO</div>
          
          <h2>De caos diario a operación premium en 48 horas</h2>
          
          <p>
            María tenía 3 clínicas. Pasaba 4 horas diarias contestando WhatsApps, coordinando terapeutas y persiguiendo pagos. 
            Hoy factura 3.2x más con el mismo equipo. ¿Su secreto? Dejó de trabajar EN su negocio y empezó a trabajar SOBRE él.
          </p>

          <a href="#" className="btn btn-primary">Ver cómo lo logró →</a>
        </div>

        {/* Right Column - Visual con íconos flotantes */}
        <div className={styles.rightColumn}>
          <div className={styles.mockup}>
            {/* Imagen central (mockup de la app) */}
            <div className={styles.mockupScreen}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.mockupLogo}>Eventora</div>
                <div className={styles.mockupText}>Plataforma SaaS para Clínicas Premium</div>
              </div>
            </div>

            {/* Íconos flotantes */}
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${styles.floatingIcon} ${styles[feature.position]}`}
                style={{
                  '--progress': scrollProgress,
                  '--color': feature.color,
                } as React.CSSProperties}
              >
                <div className={styles.iconCircle}>
                  <span className={styles.iconEmoji}>{feature.icon}</span>
                </div>
                <div className={styles.iconTooltip}>
                  <div className={styles.iconTitle}>{feature.title}</div>
                  <small>{feature.description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
