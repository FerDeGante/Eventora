"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Animated particles con paleta Eventora
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }> = [];

    const colors = ["#38BDF8", "#0EA5E9", "#6366F1", "#4F46E5", "#F97316"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <canvas ref={canvasRef} className={styles.canvas} />
      
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>La decisión que cambió todo para +120 clínicas</span>
        </div>

        <h1 className={styles.title}>
          Clases con cupo y sesiones 1:1 que se reservan y se pagan en{" "}
          <span className={styles.titleGradient}>minutos</span>
        </h1>

        <p className={styles.description}>
          Eventora es el sistema para clínicas wellness que manejan clases (capacidad N) y sesiones individuales (capacidad 1).
          <br />
          Tus clientes eligen horario, pagan y reciben confirmación en minutos — sin llamadas ni cobros manuales.
        </p>

        <div className={styles.actions}>
          <Link href="/demo" className={styles.primaryButton}>
            Ver demo de reservas y pagos
          </Link>
          <Link href="#caracteristicas" className={styles.secondaryButton}>
            Ver cómo funciona
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>N + 1</div>
            <div className={styles.statLabel}>Clases grupales + sesiones 1:1</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>5 min</div>
            <div className={styles.statLabel}>De reserva a pago confirmado</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>48h</div>
            <div className={styles.statLabel}>Para estar operando</div>
          </div>
        </div>
      </div>
    </section>
  );
}
