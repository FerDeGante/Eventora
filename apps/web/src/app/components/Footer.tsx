"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Lluvia de estrellas
    interface Star {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      color: string;
    }

    const stars: Star[] = [];
    const starCount = 15;
    const colors = ["#38BDF8", "#6366F1", "#EC4899", "#F97316", "#FFFFFF"];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        length: Math.random() * 40 + 15,
        speed: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationFrame: number;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.y += star.speed;

        if (star.y > canvas.height) {
          star.y = -star.length;
          star.x = Math.random() * canvas.width;
        }

        // Dibujar estrella (línea vertical con ligera inclinación)
        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x + star.length * 0.1, star.y + star.length
        );
        gradient.addColorStop(0, `${star.color}00`);
        gradient.addColorStop(0.5, `${star.color}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${star.color}00`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length * 0.1, star.y + star.length);
        ctx.stroke();

        // Punto brillante al final
        ctx.fillStyle = star.color + Math.floor(star.opacity * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = 3;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(star.x + star.length * 0.1, star.y + star.length, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

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

  const productLinks = [
    { name: "Características", href: "#caracteristicas" },
    { name: "Precios", href: "#precios" },
    { name: "Integraciones", href: "#" },
    { name: "Changelog", href: "#" },
  ];

  const resourcesLinks = [
    { name: "Documentación", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Guías", href: "#" },
    { name: "Soporte", href: "#" },
  ];

  const companyLinks = [
    { name: "Nosotros", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contacto", href: "#" },
  ];

  const legalLinks = [
    { name: "Privacidad", href: "#" },
    { name: "Términos", href: "#" },
    { name: "Seguridad", href: "#" },
    { name: "Compliance", href: "#" },
  ];

  const socialLinks = [
    { name: "Instagram", href: "#", icon: "📷" },
    { name: "GitHub", href: "#", icon: "💻" },
    { name: "LinkedIn", href: "#", icon: "💼" },
    { name: "YouTube", href: "#", icon: "📺" },
  ];

  return (
    <footer className={styles.footer}>
      <canvas ref={canvasRef} className={styles.starsCanvas} />
      
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className={styles.logoText}>Eventora</span>
            </div>
            <p className={styles.tagline}>
              Plataforma SaaS premium para clínicas de salud sensorial. Gestión completa de reservas, POS, inventario y personal.
            </p>
            <div className={styles.socials}>
              {socialLinks.map((link, index) => (
                <Link key={index} href={link.href} className={styles.socialLink}>
                  <span>{link.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>PRODUCTO</h4>
              <ul className={styles.linkList}>
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>RECURSOS</h4>
              <ul className={styles.linkList}>
                {resourcesLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>EMPRESA</h4>
              <ul className={styles.linkList}>
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>LEGAL</h4>
              <ul className={styles.linkList}>
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2024 Eventora. Diseñado con 💜
          </p>
          <div className={styles.certifications}>
            <span className={styles.cert}>SOC 2 TYPE II</span>
            <span className={styles.cert}>GDPR READY</span>
            <span className={styles.cert}>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
