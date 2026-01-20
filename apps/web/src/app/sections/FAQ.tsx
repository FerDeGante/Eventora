"use client";

import { useState } from "react";
import styles from "./FAQ.module.css";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "¿Cuánto tiempo toma implementar Eventora?",
      answer: "48 horas. Día 1: importamos tu data y configuramos tu cuenta. Día 2: capacitamos a tu equipo (2 horas) y ya estás operando. La mayoría de nuestros clientes procesan su primera reserva en las primeras 6 horas."
    },
    {
      question: "¿Qué pasa con mis datos actuales?",
      answer: "Migramos todo. Tus clientes, historial de citas, terapeutas y servicios. Nuestro equipo hace la migración por ti. Cero pérdida de información, cero trabajo manual de tu parte."
    },
    {
      question: "¿Necesito conocimientos técnicos?",
      answer: "Cero. Si usas WhatsApp, puedes usar Eventora. El sistema está diseñado para dueños de clínicas, no para ingenieros. Tu recepcionista lo aprende en 30 minutos."
    },
    {
      question: "¿Funciona con Stripe y Mercado Pago al mismo tiempo?",
      answer: "Sí. Tus clientes eligen cómo pagar. El sistema maneja ambos automáticamente. También aceptamos efectivo (registrado en el sistema para trazabilidad completa)."
    },
    {
      question: "¿Qué pasa si tengo un problema técnico?",
      answer: "Soporte 24/7 por WhatsApp, email y videollamada. Tiempo de respuesta promedio: 8 minutos. SLA de 99.9% de uptime (si fallamos, te compensamos). Nunca estarás solo."
    },
    {
      question: "¿Puedo cancelar cuando quiera?",
      answer: "Sí. Sin contratos anuales, sin penalizaciones. Exportas todos tus datos en un click y te vas. (Aunque nunca ha pasado - 98% de nuestros clientes renuevan cada año)."
    },
    {
      question: "¿Realmente recuperaré la inversión en 30 días?",
      answer: "Promedio de nuestros clientes: recuperan el costo en 18 días. ¿Cómo? Más reservas (sistema 24/7), cero no-shows (recordatorios automáticos), cobros adelantados (flujo de caja inmediato). Si en 30 días no ves ROI, devolvemos el 100%."
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>PREGUNTAS FRECUENTES</span>
          <h2 className={styles.title}>
            Las dudas que tenías <span className={styles.gradient}>antes de decidir</span>
          </h2>
          <p className={styles.subtitle}>
            Estas son las preguntas que hacen todos los dueños de clínicas antes de transformar su negocio.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={styles.chevron} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaText}>
            ¿Tienes otra pregunta? Hablemos directamente.
          </p>
          <a href="/demo" className={styles.ctaButton}>
            Agendar llamada con el equipo →
          </a>
        </div>
      </div>
    </section>
  );
}
