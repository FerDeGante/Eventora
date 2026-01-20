"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./EventoraModules.module.css";

export function EventoraModules() {
  const [activeIndex, setActiveIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modules = [
    {
      icon: "📅",
      name: "Clases (capacidad N) sin fricción",
      description: "Abre cupos, vende lugares y confirma asistencia en minutos, incluso cuando duermes."
    },
    {
      icon: "💳",
      name: "Sesiones 1:1 con pago inmediato",
      description: "Tus clientes reservan y pagan en el mismo flujo. Cobro asegurado en minutos."
    },
    {
      icon: "🛍️",
      name: "Reservas 24/7 sin recepcionista",
      description: "Agenda autoservicio para clases y sesiones sin llamadas, sin mensajes, sin estrés."
    },
    {
      icon: "📧",
      name: "Confirmación y cobro en minutos",
      description: "Emails y recordatorios automáticos para reducir no-shows y acelerar el time-to-cash."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [modules.length]);

  // Animaciones cósmicas tipo Relativum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = 40;
    const colors = ["#38BDF8", "#6366F1", "#EC4899", "#F97316"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Ondas concéntricas
      for (let i = 0; i < 4; i++) {
        const radius = (time * 100 + i * 100) % 500;
        const opacity = 1 - (radius / 500);
        ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Partículas con conexiones
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Conectar partículas cercanas
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 1 - (distance / 120);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      // Agujero negro pulsante
      const blackHoleRadius = 80 + Math.sin(time * 2) * 10;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, blackHoleRadius
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(0.4, "rgba(99, 102, 241, 0.4)");
      gradient.addColorStop(0.7, "rgba(56, 189, 248, 0.2)");
      gradient.addColorStop(1, "rgba(56, 189, 248, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, blackHoleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Partículas orbitando
      for (let i = 0; i < 8; i++) {
        const angle = time * 2 + (i * Math.PI * 2) / 8;
        const orbitRadius = 120 + Math.sin(time * 3 + i) * 15;
        const x = canvas.width / 2 + Math.cos(angle) * orbitRadius;
        const y = canvas.height / 2 + Math.sin(angle) * orbitRadius;
        
        ctx.fillStyle = "#F97316";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#F97316";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.splitLayout}>
          <div className={styles.visualSide}>
            <canvas ref={canvasRef} className={styles.cosmicCanvas} />
            <div className={styles.carouselContainer}>
              {modules.map((module, index) => (
                <div
                  key={index}
                  className={`${styles.carouselSlide} ${
                    index === activeIndex ? styles.active : ""
                  }`}
                >
                  <div className={styles.slideContent}>
                    <span className={styles.slideIcon}>{module.icon}</span>
                    <h3>{module.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.contentSide}>
            <div className={styles.sectionHeader}>
              <span className={styles.badge}>EL SISTEMA COMPLETO</span>
              <h2 className={styles.title}>El sistema para clases y sesiones que cobran en minutos</h2>
              <p className={styles.subtitle}>
                No vendemos software. Te entregamos el sistema exacto que usan las clínicas wellness que operan clases grupales y sesiones 1:1 con cobro inmediato.
              </p>
            </div>

            <div className={styles.modulesList}>
              {modules.map((module, index) => (
                <div
                  key={index}
                  className={`${styles.moduleItem} ${index === activeIndex ? styles.active : ""}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className={styles.progressBar}>
                    <div className={`${styles.progressFill} ${index === activeIndex ? styles.active : ""}`} />
                  </div>
                  <div className={styles.moduleContent}>
                    <div className={styles.moduleIcon}>{module.icon}</div>
                    <div className={styles.moduleInfo}>
                      <h4 className={styles.moduleName}>{module.name}</h4>
                      <p className={styles.moduleDesc}>{module.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a href="#" className={styles.ctaButton}>Explorar plataforma →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
