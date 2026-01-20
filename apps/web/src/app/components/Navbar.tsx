"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <span className={styles.logoText}>Eventora</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="#caracteristicas" className={styles.navLink}>
            Características
          </Link>
          <Link href="#precios" className={styles.navLink}>
            Precios
          </Link>
          <Link href="#recursos" className={styles.navLink}>
            Recursos
          </Link>
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginButton}>
            Iniciar sesión
          </Link>
          <Link href="/demo" className={styles.ctaButton}>
            Probar Eventora
          </Link>
        </div>
      </nav>
    </header>
  );
}
