"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EventoraButton } from "../components/ui/EventoraButton";
import { useRouter } from "next/navigation";

export function GeminiHero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white dark:bg-[#202124]">
      {/* Animated gradient background - Numaris style */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 dark:from-[#202124] dark:via-[#1A1B1F] dark:to-[#0D324D]/20"
        />
        
        {/* Geometric shapes - subtle and professional */}
        <motion.div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(26,115,232,0.08) 0%, transparent 70%)",
            y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]),
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(161,66,244,0.06) 0%, transparent 70%)",
            y: useTransform(scrollYProgress, [0, 1], ["0%", "20%"]),
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Grid pattern - very subtle like Numaris */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
             style={{
               backgroundImage: `linear-gradient(#1A73E8 1px, transparent 1px), linear-gradient(90deg, #1A73E8 1px, transparent 1px)`,
               backgroundSize: '80px 80px'
             }}
        />
      </div>

      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-8">
        <motion.div 
          style={{ opacity }}
          className="max-w-7xl mx-auto w-full"
        >
          {/* Badge - Chrome style */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full 
                          bg-gradient-to-r from-blue-50 to-indigo-50 
                          dark:from-blue-900/10 dark:to-indigo-900/10
                          border border-blue-100/50 dark:border-blue-800/20
                          backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Sistema operativo para clínicas premium
              </span>
            </div>
          </motion.div>

          {/* Hero Title - Ultra clean like Gemini */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-8"
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#202124] dark:text-white leading-[1.1]">
              Gestiona tu cadena
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.1] mt-2
                           bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A142F4] 
                           bg-clip-text text-transparent">
              con inteligencia
            </span>
          </motion.h1>

          {/* Subtitle - Perfect spacing like Chrome */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center text-lg sm:text-xl md:text-2xl text-[#5F6368] dark:text-[#9AA0A6] 
                       max-w-4xl mx-auto mb-12 font-light leading-relaxed px-4"
          >
            Reservaciones multicentro, POS omnicanal, marketplace y automatizaciones.
            <br className="hidden sm:block" />
            Todo con la experiencia de diseño que esperan tus clientes.
          </motion.p>

          {/* CTA Buttons - Material Design 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="group relative px-8 py-4 bg-[#1A73E8] hover:bg-[#1557B0] 
                       text-white font-medium text-base rounded-full
                       shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]
                       hover:shadow-[0_3px_8px_rgba(0,0,0,0.16),0_3px_8px_rgba(0,0,0,0.23)]
                       transition-all duration-300 ease-out
                       active:scale-95"
            >
              <span className="relative z-10">Ir al panel</span>
            </button>
            
            <button
              onClick={() => router.push("/marketplace")}
              className="px-8 py-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5
                       text-[#1A73E8] dark:text-[#8AB4F8] font-medium text-base rounded-full
                       border border-[#DADCE0] dark:border-[#5F6368]
                       transition-all duration-300 ease-out
                       active:scale-95"
            >
              Ver demo →
            </button>
          </motion.div>

          {/* Feature Pills - Numaris style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto mb-24 px-4"
          >
            {[
              "Stripe + Mercado Pago",
              "WhatsApp + Resend",
              "POS omnicanal",
              "Multi-sucursal",
              "Paquetes inteligentes"
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
                className="group px-5 py-2.5 rounded-full text-sm font-medium
                         bg-white/80 dark:bg-[#292A2D]/80 backdrop-blur-sm
                         text-[#5F6368] dark:text-[#9AA0A6]
                         border border-[#E8EAED] dark:border-[#5F6368]/30
                         hover:border-[#1A73E8]/30 dark:hover:border-[#8AB4F8]/30
                         hover:shadow-sm
                         transition-all duration-300 ease-out"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>

          {/* Stats - Clean grid like Numaris */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto 
                       pt-16 border-t border-[#E8EAED] dark:border-[#5F6368]/20"
          >
            {[
              { value: "99.9%", label: "Uptime garantizado", sublabel: "SLA enterprise" },
              { value: "+45%", label: "Conversión promedio", sublabel: "en paquetes" },
              { value: "2s", label: "Tiempo de checkout", sublabel: "POS + Stripe" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-light bg-gradient-to-br from-[#1A73E8] to-[#A142F4] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-base font-medium text-[#202124] dark:text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
