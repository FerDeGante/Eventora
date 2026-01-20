"use client";

import Link from "next/link";
import styles from "./FinalCTA.module.css";

export function FinalCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.badge}>LA DECISIÓN ESTÁ EN TUS MANOS</span>
          
          <h2 className={styles.title}>
            Hoy decides si sigues atrapado en el día a día...
            <br />
            <span className={styles.gradient}>o si recuperas tu libertad</span>
          </h2>

          <p className={styles.description}>
            120 dueños de clínicas ya tomaron esta decisión. Hoy facturan 3.2x más, trabajan 15 horas menos por semana, y por fin tienen tiempo para lo que realmente importa.
            <br /><br />
            La diferencia entre ellos y tú es una decisión. Una llamada de 30 minutos.
          </p>

          <div className={styles.urgency}>
            <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <strong>Solo quedan 7 espacios disponibles este mes</strong>
              <p>Limitamos la cantidad de clientes nuevos para garantizar onboarding personalizado.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/demo" className={styles.primaryButton}>
              <span>Agendar mi demo personalizada</span>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link href="#precios" className={styles.secondaryButton}>
              Ver planes y precios
            </Link>
          </div>

          <div className={styles.guarantee}>
            <div className={styles.guaranteeIcon}>✓</div>
            <div className={styles.guaranteeText}>
              <strong>Garantía de 30 días</strong> · Sin riesgo · Cancela cuando quieras
            </div>
          </div>
        </div>

        <div className={styles.visualSide}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>15hrs</div>
              <div className={styles.statLabel}>Recuperadas semanalmente</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>3.2x</div>
              <div className={styles.statLabel}>Facturación promedio</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>48h</div>
              <div className={styles.statLabel}>Para estar operando</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Tasa de renovación</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
